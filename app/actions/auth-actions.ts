'use server';

import { AuthError } from 'next-auth';
import { signIn as nextAuthSignIn, signOut as nextAuthSignOut } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { UserRole } from '@prisma/client';

export async function signIn(provider: string) {
	try {
		await nextAuthSignIn(provider);
	} catch (error) {
		if (error instanceof AuthError) {
			switch (error.type) {
				case 'OAuthAccountNotLinked':
					return {
						error: 'This email is already associated with another account.',
					};
				case 'OAuthSignInError':
					return { error: 'Error signing in with OAuth.' };
				default:
					return { error: 'Something went wrong.' };
			}
		}
		throw error;
	}
}

export async function signOut() {
	try {
		await nextAuthSignOut();
		redirect('/');
	} catch (error) {
		if (error instanceof AuthError) {
			return { error: 'Error signing out.' };
		}
		throw error;
	}
}

export async function completeProfile(data: {
	email: string;
	phoneNumber: string;
	profession: string;
	dateOfBirth: Date;
	sex: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
}) {
	try {
		// Check if user exists
		const user = await db.user.findUnique({
			where: { email: data.email },
		});

		if (user) {
			// Update existing user
			await db.user.update({
				where: { email: data.email },
				data: {
					phoneNumber: data.phoneNumber,
					profession: data.profession,
					dateOfBirth: data.dateOfBirth,
					sex: data.sex,
				},
			});
		} else {
			// Create new user
			await db.user.create({
				data: {
					email: data.email,
					phoneNumber: data.phoneNumber,
					profession: data.profession,
					dateOfBirth: data.dateOfBirth,
					sex: data.sex,
					role: UserRole.PLAYER, // Set default role
				},
			});
		}

		redirect('/dashboard');
	} catch (error) {
		console.error('Error completing profile:', error);
		return { error: 'Failed to complete profile' };
	}
}
