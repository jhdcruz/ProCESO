import type { MantineColor } from '@mantine/core';
import type { Enums } from '@/libs/supabase/_database';
import { Emotions } from '@/libs/huggingface/types';

/**
 * Return role-specific colors
 * for use with Badges, and such.
 *
 * @param role - User's role in the system.
 */
export const getRoleColor = (
  role?: Enums<'roles_user'> | null,
): MantineColor => {
  switch (role?.toLowerCase()) {
    case 'admin':
      return 'red';
    case 'staff':
      return 'brand';
    case 'faculty':
      return 'green';
    default:
      return 'blue';
  }
};

/**
 * Return department-specific colors
 * for use with Badges, and such.
 *
 * @param dept - Faculty's dept in the system.
 */
export const getDeptColor = (
  dept?: Enums<'roles_dept'> | null,
): MantineColor => {
  switch (dept?.toLowerCase()) {
    case 'ccs':
      return 'blue';
    case 'cea':
      return 'red';
    case 'coa':
      return 'green';
    case 'cbe':
      return 'violet';
    case 'ceso':
      return 'brand';
    case 'itso':
      return 'orange';
    default:
      return 'gray';
  }
};

/**
 * Return position-specific colors
 * for use with Badges, and such.
 *
 * @param pos - Faculty's dept in the system.
 */
export const getPosColor = (pos?: Enums<'roles_pos'> | null): MantineColor => {
  switch (pos?.toLowerCase()) {
    case 'head':
      return 'blue';
    case 'dean':
      return 'red';
    default:
      return 'brand';
  }
};

/**
 * Return evaluator-specific colors
 *
 * @param type - Feedback type
 */
export const getEvaluatorColor = (
  type: Enums<'feedback_type'>,
): MantineColor => {
  switch (type) {
    case 'beneficiaries':
      return 'pink.4';
    case 'implementers':
      return 'cyan.4';
    case 'partners':
      return 'indigo.4';
    default:
      return 'yellow.4';
  }
};

export const getEmotionColor = (emotion: keyof Emotions): MantineColor => {
  switch (emotion) {
    // Positive emotions
    case 'joy':
      return 'yellow.6';
    case 'love':
      return 'pink.5';
    case 'admiration':
      return 'violet.7';
    case 'pride':
      return 'orange.5';
    case 'gratitude':
      return 'teal.6';
    case 'optimism':
      return 'lime.5';
    case 'amusement':
      return 'cyan.6';
    case 'approval':
      return 'green.7';
    case 'excitement':
      return 'yellow.8';
    case 'relief':
      return 'mint.6';
    case 'caring':
      return 'rose.6';

    // Negative emotions
    case 'anger':
      return 'red.8';
    case 'sadness':
      return 'blue.7';
    case 'fear':
      return 'red.8';
    case 'disgust':
      return 'grape.7';
    case 'disappointment':
      return 'indigo.6';
    case 'disapproval':
      return 'red.6';
    case 'grief':
      return 'gray.7';
    case 'remorse':
      return 'blue.6';
    case 'annoyance':
      return 'orange.7';
    case 'embarrassment':
      return 'pink.7';

    // Neutral/Other emotions
    case 'neutral':
      return 'gray.6';
    case 'confusion':
      return 'violet.5';
    case 'curiosity':
      return 'blue.5';
    case 'desire':
      return 'grape.5';
    case 'nervousness':
      return 'orange.6';
    case 'realization':
      return 'cyan.7';
    case 'surprise':
      return 'lime.7';

    default:
      return 'gray';
  }
};
