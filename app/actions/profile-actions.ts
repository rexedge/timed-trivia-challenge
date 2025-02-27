"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/auth";

export async function updateProfile(data: {
  name: string;
  phoneNumber: string;
  profession: string;
}) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { error: "Not authenticated" };
    }

    await db.user.update({
      where: { id: session.user.id },
      data: {
        name: data.name,
        phoneNumber: data.phoneNumber,
        profession: data.profession,
      },
    });

    revalidatePath("/dashboard/profile");
    revalidatePath("/admin/profile");
    return { success: true };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { error: "Failed to update profile" };
  }
}
