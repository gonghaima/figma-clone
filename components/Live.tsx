import { useCallback, useState } from 'react';
import { useMyPresence, useOthers } from '@/liveblocks.config';
import LiveCursors from './cursor/LiveCursors'
import { CursorMode, CursorState, Reaction, ReactionEvent } from "@/types/type";

function Live() {
    const others = useOthers();
    const [{ cursor }, updateMyPresence] = useMyPresence() as any;

    // track the state of the cursor (hidden, chat, reaction, reaction selector)
    const [cursorState, setCursorState] = useState<CursorState>({
        mode: CursorMode.Hidden,
    });


    // Listen to mouse events to change the cursor state
    const handlePointerMove = useCallback((event: React.PointerEvent) => {
        event.preventDefault();

        // if cursor is not in reaction selector mode, update the cursor position
        if (cursor == null || cursorState.mode !== CursorMode.ReactionSelector) {
            // get the cursor position in the canvas
            const x = event.clientX - event.currentTarget.getBoundingClientRect().x;
            const y = event.clientY - event.currentTarget.getBoundingClientRect().y;

            // broadcast the cursor position to other users
            updateMyPresence({
                cursor: {
                    x,
                    y,
                },
            });
        }
    }, []);

    const handlePointerLeave = useCallback((event: React.PointerEvent) => {
        event.preventDefault();
        // if cursor is not in reaction selector mode, update the cursor position
        if (cursor == null || cursorState.mode !== CursorMode.ReactionSelector) {
            // broadcast the cursor position to other users
            updateMyPresence({
                cursor: null,
                message: null
            });
        }
    }, []);

    const handlePointerDown = useCallback((event: React.PointerEvent) => {
        // if cursor is not in reaction selector mode, update the cursor position
        if (cursor == null || cursorState.mode !== CursorMode.ReactionSelector) {
            // get the cursor position in the canvas
            const x = event.clientX - event.currentTarget.getBoundingClientRect().x;
            const y = event.clientY - event.currentTarget.getBoundingClientRect().y;

            // broadcast the cursor position to other users
            updateMyPresence({
                cursor: {
                    x,
                    y,
                },
            });
        }
    }, []);

    return (
        <div
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
            onPointerDown={handlePointerDown}
            className="h-[100vh] w-full flex justify-center items-center border-2 border-green-50"
        >
            <h1 className='text-2xl text-white'>Liveblock Figma Clone</h1>
            <LiveCursors others={others} />
        </div>
    )
}

export default Live