// Gmail-style password rules + live strength evaluation.
// Shared by the client UI (PasswordStrength component) and the auth store
// validation, so what the user sees matches what the server accepts.
//
// Rules implemented (per Google's own password spec):
//   HARD RULES (required)
//     1. Length: at least 8 characters
//     2. Allowed characters: letters (case-sensitive), numbers, symbols
//     3. Standard ASCII only (no accented characters like á, é, ñ)
//   REJECTION CRITERIA (Google will block these)
//     4. Not a common / blacklisted password
//     5. No leading or trailing space
//     6. Does not contain your name, username, or email

export type PasswordRuleId =
  | 'minLength'
  | 'asciiOnly'
  | 'noEdgeSpace'
  | 'notCommon'
  | 'noPersonalInfo';

export interface PasswordRule {
  id: PasswordRuleId;
  label: string;
  description: string;
  passed: boolean;
  required: boolean;
}

export type StrengthTier = 'empty' | 'easy' | 'moderate' | 'strong' | 'veryStrong';

export interface PasswordEvaluation {
  rules: PasswordRule[];
  strength: StrengthTier;
  score: number; // 0..4
  isAcceptable: boolean; // all hard rules + rejection criteria pass
}

// Common passwords Google will reject. Lowercase, no spaces.
const COMMON_PASSWORDS = new Set<string>([
  'password', 'passw0rd', 'password1', 'password12', 'password123',
  'qwerty', 'qwerty1', 'qwerty12', 'qwerty123', 'qwertyuiop',
  '12345678', '123456789', '1234567890', '11111111', '111111111',
  '1111111111', '00000000', '0000000000', '01234567', '012345678',
  '0123456789', '98765432', '987654321', '9876543210', 'abcdefg',
  'abcdefgh', 'abcdefghi', 'abc123', 'abcd1234', 'iloveyou',
  'admin', 'admin123', 'welcome', 'welcome1', 'welcome123',
  'letmein', 'monkey', 'monkey12', 'monkey123', 'dragon',
  'dragon12', 'dragon123', 'sunshine', 'princess', 'princess1',
  'princess12', 'princess123', 'football', 'football1', 'football12',
  'football123', 'baseball', 'baseball1', 'baseball12', 'baseball123',
  'master', 'master1', 'master12', 'master123', 'login',
  'login123', 'starwars', 'trustno1', 'jordan', 'jordan23',
  'harley', 'ranger', 'hunter', 'hunter2', 'shadow',
  'michael', 'jennifer', 'thomas', 'charlie', 'ashley',
  'daniel', 'matthew', 'andrew', 'joshua', 'jessica',
  'superman', 'batman', 'spiderman', 'letmein1', 'passwd',
  'passwd1', 'passwd12', 'passwd123', 'p@ssw0rd', 'p@ssword',
  'p@ssword1', 'p@ssword12', 'p@ssword123',
]);

const PASSWORD_MIN = 8;
const PASSWORD_MAX = 128;
const ASCII_ONLY = /^[\x20-\x7E]+$/;

export interface PersonalInfo {
  name?: string;
  email?: string;
}

export function evaluatePassword(
  password: string,
  personal: PersonalInfo = {}
): PasswordEvaluation {
  const empty: PasswordEvaluation = {
    rules: getEmptyRules(),
    strength: 'empty',
    score: 0,
    isAcceptable: false,
  };
  if (!password) return empty;

  // HARD RULES
  const lengthOk = password.length >= PASSWORD_MIN && password.length <= PASSWORD_MAX;
  const asciiOk = ASCII_ONLY.test(password);

  // REJECTION CRITERIA
  const lower = password.toLowerCase();
  const startsWithSpace = password.length > 0 && password.startsWith(' ');
  const endsWithSpace = password.length > 0 && password.endsWith(' ');
  const noEdgeSpace = !startsWithSpace && !endsWithSpace;

  // Common-password check: full string OR a 6+ char prefix (Google flags
  // "password1234" as risky because of the "password" prefix).
  let notCommon = !COMMON_PASSWORDS.has(lower);
  if (notCommon && password.length >= 6) {
    for (let i = 6; i <= Math.min(password.length, 16); i++) {
      if (COMMON_PASSWORDS.has(lower.slice(0, i))) {
        notCommon = false;
        break;
      }
    }
  }

  // Personal info: name or email username must not appear in the password.
  const nameNorm = (personal.name || '').trim().toLowerCase();
  const emailNorm = (personal.email || '').trim().toLowerCase();
  const emailUser = emailNorm.split('@')[0] || '';
  const nameMatch = nameNorm.length >= 2 && lower.includes(nameNorm);
  const emailUserMatch = emailUser.length >= 2 && lower.includes(emailUser);
  const noPersonalInfo = !nameMatch && !emailUserMatch;

  const rules: PasswordRule[] = [
    {
      id: 'minLength',
      label: `At least ${PASSWORD_MIN} characters`,
      description: `Your password must be at least ${PASSWORD_MIN} characters long.`,
      passed: lengthOk,
      required: true,
    },
    {
      id: 'asciiOnly',
      label: 'Standard ASCII characters only',
      description: 'Accented characters (á, é, ñ) and other non-ASCII symbols are not supported.',
      passed: asciiOk,
      required: true,
    },
    {
      id: 'noEdgeSpace',
      label: 'No leading or trailing space',
      description: 'Spaces at the very start or end will be rejected. Spaces inside the password are fine.',
      passed: noEdgeSpace,
      required: true,
    },
    {
      id: 'notCommon',
      label: 'Not a common password',
      description: 'Avoid common passwords like password123, qwerty, 12345678.',
      passed: notCommon,
      required: true,
    },
    {
      id: 'noPersonalInfo',
      label: "Doesn't contain your name or email",
      description: "Don't use your name, username, or email in the password.",
      passed: noPersonalInfo,
      required: true,
    },
  ];

  const isAcceptable = rules.every((r) => r.passed);

  // Strength tier (after rules pass). Gmail itself does not publish a strength
  // meter, so we use length as the secondary signal: longer = stronger.
  //   - Any required rule fails     -> "easy" (rejected)
  //   - 8-11 chars, all rules pass  -> "moderate"
  //   - 12-15 chars, all rules pass -> "strong"
  //   - 16+ chars,   all rules pass -> "very strong"
  let strength: StrengthTier;
  let score: number;
  if (!isAcceptable) {
    strength = 'easy';
    score = 1;
  } else if (password.length >= 16) {
    strength = 'veryStrong';
    score = 4;
  } else if (password.length >= 12) {
    strength = 'strong';
    score = 3;
  } else {
    strength = 'moderate';
    score = 2;
  }

  return { rules, strength, score, isAcceptable };
}

function getEmptyRules(): PasswordRule[] {
  return [
    { id: 'minLength', label: `At least ${PASSWORD_MIN} characters`, description: '', passed: false, required: true },
    { id: 'asciiOnly', label: 'Standard ASCII characters only', description: '', passed: false, required: true },
    { id: 'noEdgeSpace', label: 'No leading or trailing space', description: '', passed: false, required: true },
    { id: 'notCommon', label: 'Not a common password', description: '', passed: false, required: true },
    { id: 'noPersonalInfo', label: "Doesn't contain your name or email", description: '', passed: false, required: true },
  ];
}

export const STRENGTH_META: Record<StrengthTier, { label: string; color: string; bar: string; text: string }> = {
  empty:      { label: '',                 color: 'muted',     bar: 'bg-muted',           text: 'text-muted-foreground' },
  easy:       { label: 'Easy',             color: 'red',       bar: 'bg-red-500',         text: 'text-red-600 dark:text-red-400' },
  moderate:   { label: 'Moderate',         color: 'orange',    bar: 'bg-orange-500',      text: 'text-orange-600 dark:text-orange-400' },
  strong:     { label: 'Strong',           color: 'green',     bar: 'bg-green-500',       text: 'text-green-600 dark:text-green-400' },
  veryStrong: { label: 'Very strong',      color: 'emerald',   bar: 'bg-emerald-600',     text: 'text-emerald-600 dark:text-emerald-400' },
};
