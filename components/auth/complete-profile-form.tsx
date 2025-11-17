'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { completeProfile } from '@/app/actions/auth-actions';
import { cn } from '@/lib/utils';

const formSchema = z.object({
	email: z.string().email(),
	phoneNumber: z
		.string()
		.min(10, 'Phone number must be at least 10 characters')
		.regex(/^[0-9+\-\s()]+$/, 'Please enter a valid phone number'),
	profession: z
		.string()
		.min(2, 'Profession must be at least 2 characters')
		.max(100, 'Profession must not exceed 100 characters'),
	dateOfBirth: z
		.date({
			required_error: 'Date of birth is required',
		})
		.refine((date) => {
			const today = new Date();
			const minDate = new Date(
				today.getFullYear() - 13,
				today.getMonth(),
				today.getDate()
			);
			return date <= minDate;
		}, 'You must be at least 13 years old'),
	sex: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'], {
		required_error: 'Please select your gender',
	}),
});

export function CompleteProfileForm({ email }: { email: string }) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email,
			phoneNumber: '',
			profession: '',
		},
	});

	async function onSubmit(values: z.infer<typeof formSchema>) {
		setIsLoading(true);
		try {
			await completeProfile(values);
			router.push('/login');
		} catch (error) {
			console.error('Error completing profile', error);
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className='space-y-6'
			>
				<FormField
					control={form.control}
					name='email'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Email</FormLabel>
							<FormControl>
								<Input
									{...field}
									disabled
									className='bg-muted'
								/>
							</FormControl>
							<FormDescription>
								Your email address cannot be changed
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name='phoneNumber'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Phone Number *</FormLabel>
							<FormControl>
								<Input
									placeholder='+234 801 234 5678'
									{...field}
									disabled={isLoading}
								/>
							</FormControl>
							<FormDescription>
								Enter your phone number with country code
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name='profession'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Profession *</FormLabel>
							<FormControl>
								<Input
									placeholder='e.g. Software Engineer, Teacher, Doctor'
									{...field}
									disabled={isLoading}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name='dateOfBirth'
					render={({ field }) => (
						<FormItem className='flex flex-col'>
							<FormLabel>Date of Birth *</FormLabel>
							<Popover>
								<PopoverTrigger asChild>
									<FormControl>
										<Button
											variant='outline'
											className={cn(
												'w-full pl-3 text-left font-normal',
												!field.value &&
													'text-muted-foreground'
											)}
											disabled={isLoading}
										>
											{field.value ? (
												format(field.value, 'PPP')
											) : (
												<span>Pick a date</span>
											)}
											<CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
										</Button>
									</FormControl>
								</PopoverTrigger>
								<PopoverContent
									className='w-auto p-0'
									align='start'
								>
									<Calendar
										mode='single'
										selected={field.value}
										onSelect={field.onChange}
										disabled={(date) =>
											date > new Date() ||
											date < new Date('1900-01-01')
										}
										initialFocus
										captionLayout='dropdown-buttons'
										fromYear={1900}
										toYear={new Date().getFullYear()}
									/>
								</PopoverContent>
							</Popover>
							<FormDescription>
								You must be at least 13 years old
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name='sex'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Gender *</FormLabel>
							<Select
								onValueChange={field.onChange}
								defaultValue={field.value}
								disabled={isLoading}
							>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder='Select your gender' />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									<SelectItem value='MALE'>Male</SelectItem>
									<SelectItem value='FEMALE'>
										Female
									</SelectItem>
									<SelectItem value='OTHER'>Other</SelectItem>
									<SelectItem value='PREFER_NOT_TO_SAY'>
										Prefer not to say
									</SelectItem>
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button
					type='submit'
					className='w-full'
					disabled={isLoading}
				>
					{isLoading ? (
						<>
							<Loader2 className='mr-2 h-4 w-4 animate-spin' />
							Saving...
						</>
					) : (
						'Complete Profile'
					)}
				</Button>
			</form>
		</Form>
	);
}
