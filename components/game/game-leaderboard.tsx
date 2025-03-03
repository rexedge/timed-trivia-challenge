"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PrivateChat } from "@/components/chat/private-chat";
import type { ExtendedParticipant } from "@/lib/types/game";

interface GameLeaderboardProps {
  participants: ExtendedParticipant[];
  userId: string;
}

export function GameLeaderboard({
  participants,
  userId,
}: GameLeaderboardProps) {
  const [selectedParticipant, setSelectedParticipant] =
    useState<ExtendedParticipant | null>(null);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Leaderboard</CardTitle>
          <CardDescription>
            Current standings ({participants.length} players)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {participants.map((participant, index) => (
              <div
                key={participant.userId}
                className="flex items-center justify-between p-2 rounded-lg bg-muted"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10">
                    <span className="text-xs font-bold text-primary">
                      {index + 1}
                    </span>
                  </div>
                  <Avatar>
                    <AvatarImage src={participant.user.image || undefined} />
                    <AvatarFallback>
                      {participant.user.name?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {participant.user.name}
                      {participant.userId === userId && " (You)"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {participant.score.toFixed(0)} pts
                    </p>
                  </div>
                </div>
                {participant.userId !== userId && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedParticipant(participant)}
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span className="sr-only">
                      Chat with {participant.user.name}
                    </span>
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={!!selectedParticipant}
        onOpenChange={() => setSelectedParticipant(null)}
      >
        <DialogContent className="max-w-md p-0">
          <DialogHeader className="p-4 border-b">
            <DialogTitle className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage
                  src={selectedParticipant?.user.image || undefined}
                />
                <AvatarFallback>
                  {selectedParticipant?.user.name?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              Chat with {selectedParticipant?.user.name}
            </DialogTitle>
          </DialogHeader>
          {selectedParticipant && (
            <PrivateChat
              recipientId={selectedParticipant.userId}
              recipientName={selectedParticipant.user.name || "User"}
              recipientImage={selectedParticipant.user.image}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
