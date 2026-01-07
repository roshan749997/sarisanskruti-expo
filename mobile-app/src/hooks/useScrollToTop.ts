// Scroll to Top Hook - Reusable for all screens
import { useState, useRef } from 'react';

export const useScrollToTop = () => {
    const [showScrollTop, setShowScrollTop] = useState(false);
    const scrollRef = useRef<any>(null);

    const handleScroll = (event: any) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        if (offsetY > 300) {
            setShowScrollTop(true);
        } else {
            setShowScrollTop(false);
        }
    };

    const scrollToTop = () => {
        scrollRef.current?.scrollTo({ y: 0, animated: true });
    };

    return {
        showScrollTop,
        scrollRef,
        handleScroll,
        scrollToTop
    };
};
