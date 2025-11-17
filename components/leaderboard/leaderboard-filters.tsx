'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';

interface LeaderboardFiltersProps {
	onFilterChange: (filters: {
		timeframe?: 'all' | 'week' | 'month' | 'today';
		category?: string;
		difficulty?: string;
		sex?: string;
		profession?: string;
		limit?: number;
	}) => void;
	showDemographicFilters?: boolean;
}

const CATEGORIES = [
	{ value: 'all', label: 'All Categories' },
	{ value: 'GENERAL_KNOWLEDGE', label: 'General Knowledge' },
	{ value: 'SCIENCE', label: 'Science' },
	{ value: 'HISTORY', label: 'History' },
	{ value: 'GEOGRAPHY', label: 'Geography' },
	{ value: 'SPORTS', label: 'Sports' },
	{ value: 'ARTS', label: 'Arts' },
	{ value: 'TECHNOLOGY', label: 'Technology' },
	{ value: 'ENTERTAINMENT', label: 'Entertainment' },
	{ value: 'LITERATURE', label: 'Literature' },
];

const DIFFICULTIES = [
	{ value: 'all', label: 'All Difficulties' },
	{ value: 'EASY', label: 'Easy' },
	{ value: 'MEDIUM', label: 'Medium' },
	{ value: 'HARD', label: 'Hard' },
	{ value: 'EXPERT', label: 'Expert' },
];

const TIMEFRAMES = [
	{ value: 'all', label: 'All Time' },
	{ value: 'week', label: 'This Week' },
	{ value: 'month', label: 'This Month' },
	{ value: 'today', label: 'Today' },
];

const SEX_OPTIONS = [
	{ value: 'all', label: 'All' },
	{ value: 'MALE', label: 'Male' },
	{ value: 'FEMALE', label: 'Female' },
	{ value: 'OTHER', label: 'Other' },
	{ value: 'PREFER_NOT_TO_SAY', label: 'Prefer Not to Say' },
	{ value: 'UNKNOWN', label: 'Unknown' },
];

export function LeaderboardFilters({
	onFilterChange,
	showDemographicFilters = false,
}: LeaderboardFiltersProps) {
	const [timeframe, setTimeframe] = useState<string>('all');
	const [category, setCategory] = useState<string>('all');
	const [difficulty, setDifficulty] = useState<string>('all');
	const [sex, setSex] = useState<string>('all');
	const [profession, setProfession] = useState<string>('');

	const handleFilterChange = (filterType: string, value: string) => {
		// Update local state
		switch (filterType) {
			case 'timeframe':
				setTimeframe(value);
				break;
			case 'category':
				setCategory(value);
				break;
			case 'difficulty':
				setDifficulty(value);
				break;
			case 'sex':
				setSex(value);
				break;
			case 'profession':
				setProfession(value);
				break;
		}

		// Build filters object
		const filters: any = {};

		if (filterType === 'timeframe' && value !== 'all') {
			filters.timeframe = value as 'all' | 'week' | 'month' | 'today';
		} else if (timeframe !== 'all') {
			filters.timeframe = timeframe as 'all' | 'week' | 'month' | 'today';
		}

		if (filterType === 'category' && value !== 'all') {
			filters.category = value;
		} else if (category !== 'all') {
			filters.category = category;
		}

		if (filterType === 'difficulty' && value !== 'all') {
			filters.difficulty = value;
		} else if (difficulty !== 'all') {
			filters.difficulty = difficulty;
		}

		if (showDemographicFilters) {
			if (filterType === 'sex' && value !== 'all') {
				filters.sex = value;
			} else if (sex !== 'all') {
				filters.sex = sex;
			}

			if (filterType === 'profession' && value) {
				filters.profession = value;
			} else if (profession) {
				filters.profession = profession;
			}
		}

		onFilterChange(filters);
	};

	const handleReset = () => {
		setTimeframe('all');
		setCategory('all');
		setDifficulty('all');
		setSex('all');
		setProfession('');
		onFilterChange({});
	};

	const hasActiveFilters =
		timeframe !== 'all' ||
		category !== 'all' ||
		difficulty !== 'all' ||
		sex !== 'all' ||
		profession !== '';

	return (
		<div className='w-full space-y-4'>
			<div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4'>
				{/* Timeframe Filter */}
				<div className='space-y-1.5 md:space-y-2'>
					<Label
						htmlFor='timeframe'
						className='text-xs md:text-sm text-muted-foreground'
					>
						Timeframe
					</Label>
					<Select
						value={timeframe}
						onValueChange={(value) =>
							handleFilterChange('timeframe', value)
						}
					>
						<SelectTrigger
							id='timeframe'
							className='text-xs md:text-sm'
						>
							<SelectValue placeholder='Select timeframe' />
						</SelectTrigger>
						<SelectContent>
							{TIMEFRAMES.map((option) => (
								<SelectItem
									key={option.value}
									value={option.value}
									className='text-xs md:text-sm'
								>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				{/* Category Filter */}
				<div className='space-y-1.5 md:space-y-2'>
					<Label
						htmlFor='category'
						className='text-xs md:text-sm text-muted-foreground'
					>
						Category
					</Label>
					<Select
						value={category}
						onValueChange={(value) =>
							handleFilterChange('category', value)
						}
					>
						<SelectTrigger
							id='category'
							className='text-xs md:text-sm'
						>
							<SelectValue placeholder='Select category' />
						</SelectTrigger>
						<SelectContent>
							{CATEGORIES.map((option) => (
								<SelectItem
									key={option.value}
									value={option.value}
									className='text-xs md:text-sm'
								>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				{/* Difficulty Filter */}
				<div className='space-y-1.5 md:space-y-2'>
					<Label
						htmlFor='difficulty'
						className='text-xs md:text-sm text-muted-foreground'
					>
						Difficulty
					</Label>
					<Select
						value={difficulty}
						onValueChange={(value) =>
							handleFilterChange('difficulty', value)
						}
					>
						<SelectTrigger
							id='difficulty'
							className='text-xs md:text-sm'
						>
							<SelectValue placeholder='Select difficulty' />
						</SelectTrigger>
						<SelectContent>
							{DIFFICULTIES.map((option) => (
								<SelectItem
									key={option.value}
									value={option.value}
									className='text-xs md:text-sm'
								>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				{/* Sex Filter - Only show if demographic filters enabled */}
				{showDemographicFilters && (
					<div className='space-y-1.5 md:space-y-2'>
						<Label
							htmlFor='sex'
							className='text-xs md:text-sm text-muted-foreground'
						>
							Sex
						</Label>
						<Select
							value={sex}
							onValueChange={(value) =>
								handleFilterChange('sex', value)
							}
						>
							<SelectTrigger
								id='sex'
								className='text-xs md:text-sm'
							>
								<SelectValue placeholder='Select sex' />
							</SelectTrigger>
							<SelectContent>
								{SEX_OPTIONS.map((option) => (
									<SelectItem
										key={option.value}
										value={option.value}
										className='text-xs md:text-sm'
									>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				)}

				{/* Profession Filter - Only show if demographic filters enabled */}
				{showDemographicFilters && (
					<div className='space-y-1.5 md:space-y-2'>
						<Label
							htmlFor='profession'
							className='text-xs md:text-sm text-muted-foreground'
						>
							Profession
						</Label>
						<Input
							id='profession'
							type='text'
							placeholder='Search profession...'
							value={profession}
							onChange={(e) =>
								handleFilterChange('profession', e.target.value)
							}
							className='text-xs md:text-sm'
						/>
					</div>
				)}
			</div>

			{/* Reset Button */}
			{hasActiveFilters && (
				<div className='flex justify-end'>
					<Button
						variant='outline'
						size='sm'
						onClick={handleReset}
						className='text-xs md:text-sm gap-1.5'
					>
						<X className='h-3 w-3 md:h-4 md:w-4' />
						Reset Filters
					</Button>
				</div>
			)}
		</div>
	);
}
