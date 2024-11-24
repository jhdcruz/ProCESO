// TODO: Use types from /eval forms
//       currently having a hard time using union types.
export interface EvaluationRemarksProps {
  response: {
    reflections?: {
      interpersonal?: string;
      productivity?: string;
      social?: string;
    };
    sentiments?: {
      beneficial?: string;
      improve?: string;
      comments?: string;
      learning?: string;
      value?: string;
    };
    implementations?: Array<{ remarks: string }>;
    objectives?: Array<{ remarks: string }>;
    outcomes?: Array<{ remarks: string }>;
    feedback?: Array<{ remarks: string }>;
  };
}

/**
 * Extracts text inputs from evaluation remarks.
 *
 * @param evaluation Evaluation remarks
 * @returns Array of text inputs
 */
export const getTextInputs = (
  evaluation: EvaluationRemarksProps[],
): string[] => {
  return evaluation.flatMap((item) => {
    const response = item.response;

    const sentiments: string[] =
      [
        response?.reflections?.interpersonal,
        response?.reflections?.productivity,
        response?.reflections?.social,
        response?.sentiments?.beneficial,
        response?.sentiments?.improve,
        response?.sentiments?.comments,
        response?.sentiments?.learning,
        response?.sentiments?.value,
      ].filter((text): text is string => !!text?.trim()) || [];

    return [
      ...(
        response?.implementations?.map(
          (obj: { remarks: string }) => obj.remarks,
        ) ?? []
      ).filter((text: string) => text.trim() !== ''),
      ...(
        response?.objectives?.map((obj: { remarks: string }) => obj.remarks) ??
        []
      ).filter((text: string) => text.trim() !== ''),
      ...(
        response?.outcomes?.map((obj: { remarks: string }) => obj.remarks) ?? []
      ).filter((text: string) => text.trim() !== ''),
      ...(
        response?.feedback?.map((obj: { remarks: string }) => obj.remarks) ?? []
      ).filter((text: string) => text.trim() !== ''),
      ...sentiments,
    ];
  });
};
