import { Button } from '@/components/ui/button';
import { ExternalLink } from '@/components/external-link';
import { IconArrowRight } from '@/components/ui/icons';

const exampleMessages = [
  {
    heading: 'Introduction to Microeconomics',
    message: 'Ask me MCQ questions on Microeconomics',
  },
  {
    heading: "Sorting Algorithms",
    message: "Ask me MCQ questions on Sorting Algorithms",
  },
  {
    heading: "Human Anatomy",
    message: "Ask me MCQ questions on Human Anatomy",
  },
];

export function EmptyScreen({
  submitMessage,
}: {
  submitMessage: (message: string) => void;
}) {
  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="rounded-lg border bg-background p-8 mb-4">
        <h1 className="mb-2 text-lg font-semibold">
          Select a topic would you like to test yourself on
        </h1>
        <p className="leading-normal text-muted-foreground">Here are some examples:</p>
        <div className="mt-4 flex flex-col items-start space-y-2 mb-4">
          {exampleMessages.map((message, index) => (
            <Button
              key={index}
              variant="link"
              className="h-auto p-0 text-base"
              onClick={async () => {
                submitMessage(message.message);
              }}
            >
              <IconArrowRight className="mr-2 text-muted-foreground" />
              {message.heading}
            </Button>
          ))}
        </div>
      </div>
      {/* <p className="leading-normal text-muted-foreground text-[0.8rem] text-center">
        Note: This is not real financial advice.
      </p> */}
    </div>
  );
}
