import { User } from 'src/user/entities/user.entity';

export function isDirectMessage(): boolean {
  return !!this.receiver && !this.room;
}

export async function getRecipients(): Promise<User[]> {
  if (this.isDirectMessage()) {
    return [this.receiver];
  } else if (this.room) {
    return this.room.members;
  }
  return [];
}
