"use client";

import { useState } from "react";
import Link from "next/link";
import { User, UserRole } from "@prisma/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreHorizontal, UserCog } from "lucide-react";
import { toast } from "sonner";
import { updateUserRole } from "@/app/actions/user-actions";
import { PaginationButton } from "@/components/pagination-button";

interface UsersListProps {
  users: (User & {
    _count: {
      responses: number;
    };
  })[];
  pagination: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
  currentUserId: string;
}

export function UsersList({
  users,
  pagination,
  currentUserId,
}: UsersListProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleRoleUpdate = async (userId: string, newRole: UserRole) => {
    if (userId === currentUserId) {
      toast.error("You cannot change your own role");
      return;
    }

    setIsLoading(userId);
    try {
      const result = await updateUserRole(userId, newRole);

      if (!result.success) {
        toast.error(result.message || "Failed to update user role");
        return;
      }

      toast.success("User role updated successfully");
    } catch (error) {
      toast.error("Failed to update user role");
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Users</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Games Played</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={user.image || undefined} />
                        <AvatarFallback>
                          {user.name?.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{user._count.responses}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          disabled={isLoading === user.id}
                        >
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/admin/users/${user.id}`}
                            className="flex items-center"
                          >
                            <UserCog className="mr-2 h-4 w-4" />
                            Manage User
                          </Link>
                        </DropdownMenuItem>
                        {user.id !== currentUserId && (
                          <>
                            <DropdownMenuItem
                              onClick={() =>
                                handleRoleUpdate(
                                  user.id,
                                  user.role === UserRole.ADMIN
                                    ? UserRole.PLAYER
                                    : UserRole.ADMIN
                                )
                              }
                            >
                              {user.role === UserRole.ADMIN
                                ? "Remove Admin"
                                : "Make Admin"}
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {pagination.pages > 1 && (
          <div className="mt-4 flex justify-center">
            <PaginationButton
              currentPage={pagination.page}
              totalPages={pagination.pages}
              baseUrl="/admin/users"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
