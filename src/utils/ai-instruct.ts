export async function instructAI(query: string) {
  const defaultEndpoint =
    'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3';

  const response = await fetch(
    process.env.HF_MODEL_INSTRUCT ??
      process.env.NEXT_PUBLIC_HF_MODEL_INSTRUCT ??
      defaultEndpoint,
    {
      headers: {
        Authorization: `Bearer ${process.env.HF_API_KEY ?? process.env.NEXT_PUBLIC_HF_API_KEY}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({
        inputs: query,
        parameters: {
          max_new_tokens: 20,
          return_full_text: false,
          max_time: 20,
        },
      }),
    },
  );

  if (!response.ok) {
    throw new Error(
      `API call failed with status: ${response.status}, ${response.statusText}`,
    );
  }

  return response.json();
}
