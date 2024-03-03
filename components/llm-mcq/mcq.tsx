'use client';

import { format, parseISO } from 'date-fns';

import { useState } from 'react'

import { CardContent, Card } from '@/components/ui/card'

import { useActions, useUIState } from 'ai/rsc';

import type { AI } from '../../app/action';

import { Button } from "@/components/ui/button"


export function MCQ({ topic, question, options, answer  }: { 
    topic: string;
    question: string;
    options: {
        id: string,
        value: string
    }[];
    answer: string; }) {

    const [, setMessages] = useUIState<typeof AI>();
    const { submitUserMessage } = useActions();

    const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null)
    const [selectedOption, setSelectedOption] = useState<string | null>(null);

  return (
    <Card className="w-full max-w-xl mx-auto p-4">
    <CardContent className="space-y-4">
      <div className="flex items-center space-x-2">
        <TagsIcon/>
        <span className="text-sm font-semibold">{topic}</span>
      </div>
      <div className="space-y-2">
        <p className="text-base font-semibold">{question}</p>
        <div className="grid gap-2 text-sm">
          {options.map((option) => (
            <button 
                className="flex justify-between items-center cursor-pointer border border-gray-300 rounded-lg p-3 hover:bg-gray-100"
                onClick={() => {
                        setSelectedOption(option.id);
                        if (answer == option.id) {
                            setIsAnswerCorrect(true);
                        } else {
                            setIsAnswerCorrect(false);
                        }
                }}
            >
              <span className="text-left flex-grow">{option.id}. {option.value}</span>
              <div className="w-1/5 text-right">
                    {isAnswerCorrect == true && answer == option.id ? 
                    <div className="flex flex-row items-center text-xs leading-none text-green-500 gap-2"><CheckIcon /> <p>Correct</p></div>
                    :
                    <div className="flex flex-row items-center text-xs leading-none text-green-500"> <p></p></div> }
                    {isAnswerCorrect == false && selectedOption == option.id ? 
                    <div className="flex flex-row items-center text-xs leading-none text-red-500 gap-2"><WrongIcon /> <p>Incorrect</p></div>
                    :
                    <div className="flex flex-row items-center text-xs leading-none text-green-500"><p></p></div> }
              </div>
            </button>
          ))}
        </div>
        { isAnswerCorrect == true ?<Button
            className="mt-2"
            onClick={async () => {
                const response = await submitUserMessage(`Ask me another MCQ`);
                setMessages(currentMessages => [...currentMessages, response]);
            }}
        >Next Question</Button> : null }
      </div>
    </CardContent>
  </Card>
  );

function CheckIcon() {
    return (
      <svg
        className="w-4 h-4 text-green-500"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    )
  }
}

function WrongIcon() {
    return (<svg
    className="h-6 w-6 text-red-500"
    fill="none"
    height="24"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    viewBox="0 0 24 24"
    width="24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M15 9l-6 6M9 9l6 6" />
  </svg>
    )
}
  
function TagsIcon() {
    return (
      <svg
        className="w-4 h-4"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 5H2v7l6.29 6.29c.94.94 2.48.94 3.42 0l3.58-3.58c.94-.94.94-2.48 0-3.42L9 5Z" />
        <path d="M6 9.01V9" />
        <path d="m15 5 6.3 6.3a2.4 2.4 0 0 1 0 3.4L17 19" />
      </svg>
    )
  }