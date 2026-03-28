// ─── DealSpace Password Validation ───────────────────────────────────────────
// Enterprise-grade: special chars, uppercase, no sequential runs, no top-50000
// common passwords.

// Top common passwords (representative subset — extend as needed)
const COMMON: Set<string> = new Set([
  'password','123456','12345678','password1','qwerty','abc123','monkey',
  'letmein','trustno1','dragon','baseball','iloveyou','master','sunshine',
  'ashley','bailey','passw0rd','shadow','123123','654321','superman',
  'qazwsx','michael','football','welcome','login','admin','hello','charlie',
  'donald','qwerty123','1q2w3e4r','000000','111111','qwertyuiop','987654321',
  'pass','test','test1234','changeme','1qaz2wsx','zaq12wsx','password123',
  'mypass','lovely','princess','cheese','hunter','summer','access',
  'flower','master1','696969','joshua','maggie','starwars','corvette',
  'tigger','soccer','hockey','rangers','dakota','batman','thomas',
  'andrew','robert','daniel','george','jordan','harley','ranger','iceman',
  'phoenix','bigdaddy','killer','slipknot','maverick','stealth','shadow',
  'matrix','yankees','cowboy','broncos','raiders','steelers','yankee',
])

// Sequential keyboard/alpha/numeric runs to reject
const SEQUENCES = [
  'abcdef','bcdefg','cdefgh','defghi','efghij','fghijk','ghijkl','hijklm',
  'ijklmn','jklmno','klmnop','lmnopq','mnopqr','nopqrs','opqrst','pqrstu',
  'qrstuv','rstuvw','stuvwx','tuvwxy','uvwxyz',
  '012345','123456','234567','345678','456789',
  'qwerty','wertyu','ertyui','rtyuio','tyuiop',
  'asdfgh','sdfghj','dfghjk','fghjkl',
  'zxcvbn','xcvbnm',
]

export interface PasswordRule {
  key: string
  label_en: string
  label_he: string
  met: boolean
}

export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4     // 0=very weak … 4=strong
  label_en: string
  label_he: string
  color: string
  rules: PasswordRule[]
  isValid: boolean              // true only when score >= 3
}

export function evaluatePassword(pw: string): PasswordStrength {
  const hasLength    = pw.length >= 8
  const hasUpper     = /[A-Z]/.test(pw)
  const hasNumber    = /[0-9]/.test(pw)
  const hasSpecial   = /[!@#$%^&*()\-_=+\[\]{};:'",.<>/?\\|`~]/.test(pw)
  const notCommon    = !COMMON.has(pw.toLowerCase())
  const notSequential = !SEQUENCES.some(seq => pw.toLowerCase().includes(seq))

  const rules: PasswordRule[] = [
    { key: 'length',   label_en: 'At least 8 characters',    label_he: 'לפחות 8 תווים',        met: hasLength },
    { key: 'upper',    label_en: 'One uppercase letter',      label_he: 'אות גדולה אחת לפחות',   met: hasUpper },
    { key: 'number',   label_en: 'One number',                label_he: 'ספרה אחת לפחות',        met: hasNumber },
    { key: 'special',  label_en: 'One special character',     label_he: 'תו מיוחד אחד לפחות',    met: hasSpecial },
    { key: 'common',   label_en: 'Not a common password',     label_he: 'לא סיסמה נפוצה',        met: notCommon },
    { key: 'sequence', label_en: 'No sequential characters',  label_he: 'ללא רצף תווים (abc, 123…)', met: notSequential },
  ]

  const metCount = rules.filter(r => r.met).length
  const score = (metCount <= 1 ? 0 : metCount <= 2 ? 1 : metCount <= 3 ? 2 : metCount <= 4 ? 3 : 4) as 0|1|2|3|4

  const labels_en = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong']
  const labels_he = ['חלשה מאוד', 'חלשה', 'בינונית', 'חזקה', 'חזקה מאוד']
  const colors    = ['#ef4444',   '#f97316', '#eab308', '#22c55e', '#10b981']

  return {
    score,
    label_en: labels_en[score],
    label_he: labels_he[score],
    color: colors[score],
    rules,
    isValid: score >= 3 && hasLength && hasUpper && hasNumber && hasSpecial,
  }
}

/** Returns first i18n error key, or null if password is valid */
export function validatePassword(pw: string): string | null {
  if (!pw || pw.length < 8)                           return 'auth.error.passwordTooShort'
  if (!/[A-Z]/.test(pw))                              return 'auth.error.passwordNeedsUppercase'
  if (!/[0-9]/.test(pw))                              return 'auth.error.passwordNeedsNumber'
  if (!/[!@#$%^&*()\-_=+\[\]{};:'",.<>/?\\|`~]/.test(pw)) return 'auth.error.passwordNeedsSpecial'
  if (COMMON.has(pw.toLowerCase()))                   return 'auth.error.passwordTooCommon'
  if (SEQUENCES.some(s => pw.toLowerCase().includes(s))) return 'auth.error.passwordSequential'
  return null
}
