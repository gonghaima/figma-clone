"use client";

import { useOthers, useSelf } from "@/liveblocks.config";
import Avatar from "./Avatar";
import { generateRandomName } from "@/lib/utils";
import styles from "./index.module.css";
import { useMemo } from 'react';

const ActiveUsers = () => {
  const users = useOthers();
  const currentUser = useSelf();
  const hasMoreUsers = users.length > 3;

  // memoize the result of this function so that it doesn't change on every render but only when there are new users joining the room
  const memoizedUsers = useMemo(() => {
    return <main className='flex items-center justify-center gap-1 py-2'>
    <div className="flex pl-3">
    {currentUser && (
      <div>
        <Avatar name="You" otherStyles="border-[3px] border-primary-green"/>
      </div>
    )}
    
    {users.slice(0, 3).map(({ connectionId }) => (
      <Avatar
        key={connectionId}
        name={generateRandomName()}
        otherStyles="-ml-3"
      />
    ))}

    {hasMoreUsers && (
      <div className={styles.more}>
        +{users.length - 3}
      </div>
    )}
    </div>
  </main>
  }, [users.length]);

    return memoizedUsers;

};


export default ActiveUsers;
