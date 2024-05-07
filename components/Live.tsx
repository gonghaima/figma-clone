import { useCallback, useEffect, useState } from 'react';
import { useMyPresence, useOthers } from '@/liveblocks.config';
import LiveCursors from './cursor/LiveCursors'
import CursorChat from './cursor/CursorChat'
import { CursorMode, CursorState, Reaction, ReactionEvent } from "@/types/type";
import ReactionSelector from './reaction/ReactionButton';


function Live() {
    const others = useOthers();
    const [{ cursor }, updateMyPresence] = useMyPresence() as any;

    // store the reactions created on mouse click
    // const [reactions, setReactions] = useState<Reaction[]>([]);

    // track the state of the cursor (hidden, chat, reaction, reaction selector)
    const [cursorState, setCursorState] = useState<CursorState>({
        mode: CursorMode.Hidden,
    });

    // set the reaction of the cursor
    const setReactions = useCallback((reaction: string) => {
        setCursorState({ mode: CursorMode.Reaction, reaction, isPressed: false });
    }, []);

    // const setReactions = useCallback((reaction: ReactionEvent) => {});

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
        setCursorState({ mode: CursorMode.Hidden });
        // if cursor is not in reaction selector mode, update the cursor position
        if (cursor == null || cursorState.mode !== CursorMode.ReactionSelector) {
            // broadcast the cursor position to other users
            updateMyPresence({
                cursor: null,
                message: null
            });
        }
    }, []);

    // Show the cursor when the mouse enters the canvas
    const handlePointerDown = useCallback(
        (event: React.PointerEvent) => {
            // get the cursor position in the canvas
            const x = event.clientX - event.currentTarget.getBoundingClientRect().x;
            const y = event.clientY - event.currentTarget.getBoundingClientRect().y;

            updateMyPresence({
                cursor: {
                    x,
                    y,
                },
            });

            // if cursor is in reaction mode, set isPressed to true
            setCursorState((state: CursorState) =>
                cursorState.mode === CursorMode.Reaction ? { ...state, isPressed: true } : state
            );
        },
        [cursorState.mode, updateMyPresence, setCursorState]
    );

    // hide the cursor when the mouse is up
    const handlePointerUp = useCallback(() => {
        setCursorState((state: CursorState) =>
            cursorState.mode === CursorMode.Reaction ? { ...state, isPressed: false } : state
        );
    }, [cursorState.mode, setCursorState]);

    // Listen to keyboard events to change the cursor state
    useEffect(() => {
        const onKeyUp = (e: KeyboardEvent) => {
            if (e.key === "/") {
                setCursorState({
                    mode: CursorMode.Chat,
                    previousMessage: null,
                    message: "",
                });
            } else if (e.key === "Escape") {
                updateMyPresence({ message: "" });
                setCursorState({ mode: CursorMode.Hidden });
            } else if (e.key === "e") {
                setCursorState({ mode: CursorMode.ReactionSelector });
            }
        };

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "/") {
                e.preventDefault();
            }
        };

        window.addEventListener("keyup", onKeyUp);
        window.addEventListener("keydown", onKeyDown);

        return () => {
            window.removeEventListener("keyup", onKeyUp);
            window.removeEventListener("keydown", onKeyDown);
        };
    }, [updateMyPresence]);

    return (
        <div
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            className="h-[100vh] w-full flex justify-center items-center"
        >
            <h1 className='text-2xl text-white'>Liveblock Figma Clone</h1>
            {cursor && (
                <CursorChat
                    cursor={cursor}
                    cursorState={cursorState}
                    setCursorState={setCursorState}
                    updateMyPresence={updateMyPresence}
                />
            )}
            {/* If cursor is in reaction selector mode, show the reaction selector */}
            {cursorState.mode === CursorMode.ReactionSelector && (
                <ReactionSelector
                    setReaction={setReactions}
                />
            )}
            <LiveCursors others={others} />
        </div>
    )
}

export default Live