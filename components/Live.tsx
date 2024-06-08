import { useCallback, useEffect, useState } from 'react';
import {
  useMyPresence,
  useOthers,
  useEventListener,
  useBroadcastEvent,
} from '@/liveblocks.config';
import LiveCursors from './cursor/LiveCursors';
import CursorChat from './cursor/CursorChat';
import { CursorMode, CursorState, Reaction, ReactionEvent } from '@/types/type';
import ReactionSelector from './reaction/ReactionButton';
import FlyingReaction from './reaction/FlyingReaction';
import useInterval from '@/hooks/useInterval';
import { Comments } from './comments/Comments';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@radix-ui/react-context-menu';
import { shortcuts } from '@/constants';

type Props = {
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
  undo: () => void;
  redo: () => void;
};

const Live = ({ canvasRef, undo, redo }: Props) => {
  const others = useOthers();
  const [{ cursor }, updateMyPresence] = useMyPresence() as any;

  const broadcast = useBroadcastEvent();

  // store the reactions created on mouse click
  const [reaction, setReaction] = useState<Reaction[]>([]);

  // track the state of the cursor (hidden, chat, reaction, reaction selector)
  const [cursorState, setCursorState] = useState<CursorState>({
    mode: CursorMode.Hidden,
  });

  // set the reaction of the cursor
  const setReactions = useCallback((reaction: string) => {
    console.log('inside setReactions');

    setCursorState((prev) => ({
      ...prev,
      mode: CursorMode.Reaction,
      reaction,
      isPressed: false,
    }));
  }, []);

  // Broadcast the reaction to other users (every 100ms)
  useInterval(() => {
    // debugger;
    if (
      cursorState.mode === CursorMode.Reaction &&
      cursorState.isPressed &&
      cursor
    ) {
      // if (cursorState.mode === CursorMode.Reaction) {
      // debugger;
      console.log('inside interval');

      // concat all the reactions created on mouse click
      setReaction((reactions) => {
        return reactions.concat([
          {
            point: { x: cursor.x, y: cursor.y },
            value: cursorState.reaction,
            timestamp: Date.now(),
          },
        ]);
      });

      // Broadcast the reaction to other users
      broadcast({
        x: cursor.x,
        y: cursor.y,
        value: cursorState.reaction,
      });
    }
  }, 100);

  useEventListener((eventData) => {
    const event = eventData.event as ReactionEvent;
    setReaction((reactions) =>
      reactions.concat([
        {
          point: { x: event.x, y: event.y },
          value: event.value,
          timestamp: Date.now(),
        },
      ])
    );
  });

  // Remove reactions that are not visible anymore (every 1 sec)
  useInterval(() => {
    setReaction((reactions) =>
      reactions.filter((reaction) => reaction.timestamp > Date.now() - 4000)
    );
  }, 1000);

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
        message: null,
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
        cursorState.mode === CursorMode.Reaction
          ? { ...state, isPressed: true }
          : state
      );
    },
    [cursorState.mode, updateMyPresence, setCursorState]
  );

  // hide the cursor when the mouse is up
  const handlePointerUp = useCallback(() => {
    setCursorState((state: CursorState) =>
      cursorState.mode === CursorMode.Reaction
        ? { ...state, isPressed: false }
        : state
    );
  }, [cursorState.mode, setCursorState]);

  // trigger respective actions when the user clicks on the right menu
  const handleContextMenuClick = useCallback((key: string) => {
    switch (key) {
      case 'Chat':
        setCursorState({
          mode: CursorMode.Chat,
          previousMessage: null,
          message: '',
        });
        break;

      case 'Reactions':
        setCursorState({ mode: CursorMode.ReactionSelector });
        break;

      case 'Undo':
        undo();
        break;

      case 'Redo':
        redo();
        break;

      default:
        break;
    }
  }, []);

  // Listen to keyboard events to change the cursor state
  useEffect(() => {
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === '/') {
        setCursorState({
          mode: CursorMode.Chat,
          previousMessage: null,
          message: '',
        });
      } else if (e.key === 'Escape') {
        updateMyPresence({ message: '' });
        setCursorState({ mode: CursorMode.Hidden });
      } else if (e.key === 'e') {
        setCursorState({ mode: CursorMode.ReactionSelector });
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/') {
        e.preventDefault();
      }
    };

    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [updateMyPresence]);

  return (
    <ContextMenu>
      <ContextMenuTrigger
        id="canvas"
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        className="h-[100vh] w-full flex justify-center items-center"
      >
        <canvas ref={canvasRef} />
        {/* ** {reaction && JSON.stringify(reaction)} ** */}
        {/* Render the reactions */}
        {reaction.map((r) => (
          <FlyingReaction
            key={r.timestamp.toString()}
            x={r.point.x}
            y={r.point.y}
            timestamp={r.timestamp}
            value={r.value}
          />
        ))}
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
          <ReactionSelector setReaction={setReactions} />
        )}
        <LiveCursors others={others} />
        <Comments />
      </ContextMenuTrigger>
      <ContextMenuContent className="right-menu-content">
        {shortcuts.map((item) => (
          <ContextMenuItem
            key={item.key}
            className="right-menu-item"
            onClick={() => handleContextMenuClick(item.name)}
          >
            <p>{item.name}</p>
            <p className="text-xs text-primary-grey-300">{item.shortcut}</p>
          </ContextMenuItem>
        ))}
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default Live;
