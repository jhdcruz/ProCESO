import { logger, task, wait } from '@trigger.dev/sdk/v3';

export const helloWorldTask = task({
  id: 'hello-world',
  // biome-ignore lint/suspicious/noExplicitAny: sample/temp file
  run: async (payload: any, { ctx }) => {
    logger.log('Hello, world!', { payload, ctx });

    await wait.for({ seconds: 5 });

    return {
      message: 'Hello, world!',
    };
  },
});
