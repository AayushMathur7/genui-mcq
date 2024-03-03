import 'server-only';

import { createAI, createStreamableUI, getMutableAIState } from 'ai/rsc';
import OpenAI from 'openai';

import {
  BotCard,
  BotMessage,
  SystemMessage,
} from '@/components/llm-mcq/message';

import { MCQ } from '@/components/llm-mcq/mcq';
import { MCQSkeleton } from '@/components/llm-mcq/mcq-skeleton';
import { spinner } from '@/components/llm-mcq/spinner';
import {
  runAsyncFnWithoutBlocking,
  sleep,
  formatNumber,
  runOpenAICompletion,
} from '@/lib/utils';
import { z } from 'zod';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

async function confirmPurchase(symbol: string, price: number, amount: number) {
  'use server';

  const aiState = getMutableAIState<typeof AI>();

  const purchasing = createStreamableUI(
    <div className="inline-flex items-start gap-1 md:items-center">
      {spinner}
      <p className="mb-2">
        Purchasing {amount} ${symbol}...
      </p>
    </div>,
  );

  const systemMessage = createStreamableUI(null);

  runAsyncFnWithoutBlocking(async () => {
    // You can update the UI at any point.
    await sleep(1000);

    purchasing.update(
      <div className="inline-flex items-start gap-1 md:items-center">
        {spinner}
        <p className="mb-2">
          Purchasing {amount} ${symbol}... working on it...
        </p>
      </div>,
    );

    await sleep(1000);

    purchasing.done(
      <div>
        <p className="mb-2">
          You have successfully purchased {amount} ${symbol}. Total cost:{' '}
          {formatNumber(amount * price)}
        </p>
      </div>,
    );

    systemMessage.done(
      <SystemMessage>
        You have purchased {amount} shares of {symbol} at ${price}. Total cost ={' '}
        {formatNumber(amount * price)}.
      </SystemMessage>,
    );

    aiState.done([
      ...aiState.get(),
      {
        role: 'system',
        content: `[User has purchased ${amount} shares of ${symbol} at ${price}. Total cost = ${
          amount * price
        }]`,
      },
    ]);
  });

  return {
    purchasingUI: purchasing.value,
    newMessage: {
      id: Date.now(),
      display: systemMessage.value,
    },
  };
}

async function submitUserMessage(content: string) {
  'use server';

  const aiState = getMutableAIState<typeof AI>();
  aiState.update([
    ...aiState.get(),
    {
      role: 'user',
      content,
    },
  ]);

  const reply = createStreamableUI(
    <BotMessage className="items-center">{spinner}</BotMessage>,
  );

  const completion = runOpenAICompletion(openai, {
    model: 'gpt-3.5-turbo',
    stream: true,
    messages: [
      {
        role: 'system',
        content: `\
You are a teaching assistant conversation bot and you can help users learn basic college concepts by quizzing them.

You and the user can discuss about different topics and the user can answer questions about them in the form of MCQ questions.

Messages inside [] means that it's a UI element or a user event. For example:
- "[MCQs are of topic = X]" means that an interface displays MCQ questions for a topic.
- "[User has selected MCQ answer = A]" means the user has clicked on answer a out of A, B, C, D as the answer to the MCQ.

- If the user requests MCQ answer of a specific CS topic, call \`show_mcq_questions\` to show the questions UI.

Besides that, you can also chat with users if needed.`,
      },
      ...aiState.get().map((info: any) => ({
        role: info.role,
        content: info.content,
        name: info.name,
      })),
    ],
    functions: [
    {
      name: 'show_mcq_question',
      description:
        'Show MCQ question for a specific topic. Use this to show four MCQ questions to the user.',
      parameters: z.object({
        topic: z
          .string()
          .describe('The name of the topic'
        ),
        question: z.array(z.string()).max(1).describe('The question about the specific topic to show to the user. It has to be difficult complexity.'),
        options: z.array(z.object({
          id: z.string().describe('The id of the option. Eg, A, B, C, D'),
          value: z.string().describe('The possible option for the question to show to the user. ')
        })).max(4).describe('The possible options for the question to show to the user.'),
        answer: z.array(z.string()).max(1).describe('The answers to the questions. Eg, A'),
      }),
    },
    ],
    temperature: 0.5,
  });

  completion.onTextContent((content: string, isFinal: boolean) => {
    reply.update(<BotMessage>{content}</BotMessage>);
    if (isFinal) {
      reply.done();
      aiState.done([...aiState.get(), { role: 'assistant', content }]);
    }
  });

  completion.onFunctionCall('show_mcq_question', async ({ topic, question, options, answer }) => {
    reply.update(
      <BotCard>
        <MCQSkeleton />
      </BotCard>,
    );

    await sleep(1000);

    reply.done(
      <BotCard>
        <MCQ topic={topic} question={question} options={options} answer={answer} />
      </BotCard>,
    );

    aiState.done([
      ...aiState.get(),
      {
        role: 'function',
        name: 'show_mcq_question',
        content: `[UI for topic ${topic} for the question ${question} with MCQ options 
          ${options} and the answer, ${answer}
        ]`,
      },
    ]);
  });
  
  return {
    id: Date.now(),
    display: reply.value,
  };
}

// Define necessary types and create the AI.

const initialAIState: {
  role: 'user' | 'assistant' | 'system' | 'function';
  content: string;
  id?: string;
  name?: string;
}[] = [];

const initialUIState: {
  id: number;
  display: React.ReactNode;
}[] = [];

export const AI = createAI({
  actions: {
    submitUserMessage,
    confirmPurchase,
  },
  initialUIState,
  initialAIState,
});
