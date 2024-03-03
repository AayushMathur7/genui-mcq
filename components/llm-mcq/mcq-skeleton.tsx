"use client"
import React from 'react';
import { CardContent, Card } from '@/components/ui/card'

export const MCQSkeleton = () => {
    const [dots, setDots] = React.useState('...');

    React.useEffect(() => {
        const interval = setInterval(() => {
            setDots(dots => dots.length < 3 ? dots + '.' : '');
        }, 500);
        return () => clearInterval(interval);
    }, []);

    return <div className="flex flex-row items-center text-md leading-none text-zinc-500">Generating question{dots}</div>;
};