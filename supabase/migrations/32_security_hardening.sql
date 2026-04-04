-- ─── Sprint 57: Security Hardening ───────────────────────────────────────────
--
-- 1. get_deal_room_proposal — comprehensive column set + strip webhook_url
--    The version in migration 05 returned only ~18 columns and missed everything
--    added in migrations 06–31 (creator_info, brand_color, business_terms,
--    payment_milestones, display_bsd, hide_grand_total, is_document_only, etc).
--    This version returns ALL proposal columns EXCEPT:
--      • access_code        — never exposed to clients (security gate)
--      • signature_data_url — not needed in the public DealRoom
--    The creator's webhook_url is stripped from creator_info using the jsonb
--    '-' operator, preventing API key leakage to deal room visitors.
--
-- 2. accept_proposal — client_name guard
--    Prevents anonymous signing: the UPDATE only fires when client_name is
--    non-NULL and non-empty, enforcing that save_client_details() ran first.
--    Signature is identical to migration 28 (five parameters) so all existing
--    callers are fully backward-compatible.

-- ── 1. get_deal_room_proposal ─────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_deal_room_proposal(p_token TEXT, p_code TEXT DEFAULT NULL)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id          uuid;
  v_access_code text;
BEGIN
  SELECT id, access_code
    INTO v_id, v_access_code
    FROM proposals
   WHERE public_token = p_token;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  -- Code gate: return sentinel when code required but not provided
  IF v_access_code IS NOT NULL AND v_access_code <> '' THEN
    IF p_code IS NULL OR p_code = '' THEN
      RETURN json_build_object('_requires_code', true);
    END IF;
    -- Wrong code → null (silent — don't reveal proposal existence)
    IF p_code <> v_access_code THEN
      RETURN NULL;
    END IF;
  END IF;

  RETURN (
    SELECT row_to_json(t) FROM (
      SELECT
        -- Identity
        id,
        user_id,

        -- Client capture fields (saved by save_client_details)
        client_name,
        client_email,
        client_company_name,
        client_tax_id,
        client_address,
        client_signer_role,

        -- Proposal content
        project_title,
        description,
        testimonials,
        success_template,
        revision_notes,

        -- Financials
        base_price,
        currency,
        add_ons,
        payment_milestones,
        include_vat,
        prices_include_vat,
        global_discount_pct,

        -- Status & lifecycle
        status,
        expires_at,
        public_token,
        is_archived,
        sent_at,
        accepted_at,

        -- Branding
        brand_color,
        -- Strip webhook_url from creator_info — it may contain third-party API keys
        CASE
          WHEN creator_info IS NOT NULL THEN creator_info - 'webhook_url'
          ELSE NULL
        END AS creator_info,

        -- Analytics
        view_count,
        last_viewed_at,
        time_spent_seconds,
        section_time,

        -- Document mode flags (Sprint 43)
        display_bsd,
        hide_grand_total,
        is_document_only,

        -- Business terms (Sprint 44.9)
        business_terms,

        -- Forensic audit (Sprint 37)
        signer_ip,
        signer_user_agent,

        -- Email delivery tracking (Sprint 39)
        delivery_email,
        email_sent_at,
        email_opened_at,

        -- Timestamps
        created_at,
        updated_at

      FROM proposals
      WHERE id = v_id
    ) t
  );
END;
$$;

GRANT EXECUTE ON FUNCTION get_deal_room_proposal(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION get_deal_room_proposal(TEXT, TEXT) TO authenticated;


-- ── 2. accept_proposal — client_name guard ────────────────────────────────────
-- Matches the signature from migration 28 (five params).
-- The only change is the added AND clauses in the WHERE predicate:
--   AND client_name IS NOT NULL
--   AND TRIM(client_name) <> ''
-- This returns FALSE instead of TRUE when called before save_client_details(),
-- blocking anonymous signers server-side.

DROP FUNCTION IF EXISTS accept_proposal(TEXT, TEXT, TEXT, TEXT, TEXT);

CREATE FUNCTION accept_proposal(
  p_token   TEXT,
  p_ip      TEXT DEFAULT NULL,
  p_ua      TEXT DEFAULT NULL,
  p_sig     TEXT DEFAULT NULL,
  p_add_ons TEXT DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE proposals
  SET
    status             = 'accepted'::proposal_status,
    updated_at         = NOW(),
    signer_ip          = p_ip,
    signer_user_agent  = p_ua,
    signature_data_url = COALESCE(NULLIF(p_sig, ''), signature_data_url),
    add_ons            = CASE
                           WHEN p_add_ons IS NOT NULL AND p_add_ons <> ''
                             THEN p_add_ons::jsonb
                           ELSE add_ons
                         END
  WHERE public_token = p_token
    AND status IN ('sent', 'viewed', 'needs_revision')
    AND client_name IS NOT NULL
    AND TRIM(client_name) <> '';

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count > 0;
END;
$$;

GRANT EXECUTE ON FUNCTION accept_proposal(TEXT, TEXT, TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION accept_proposal(TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
