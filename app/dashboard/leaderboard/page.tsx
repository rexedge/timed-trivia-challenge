'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { LeaderboardTable } from '@/components/leaderboard/leaderboard-table';
import { LeaderboardFilters } from '@/components/leaderboard/leaderboard-filters';
import {
	getAllTimeLeaderboard,
	getDemographicBreakdown,
} from '@/app/actions/leaderboard-actions';
import type {
	LeaderboardData,
	LeaderboardFilters as Filters,
	DemographicBreakdown,
} from '@/lib/types/leaderboard';
import { Trophy, TrendingUp, Users, Target } from 'lucide-react';

export default function LeaderboardPage() {
	const [filters, setFilters] = useState<Filters>({});
	const [leaderboardData, setLeaderboardData] =
		useState<LeaderboardData | null>(null);
	const [demographicData, setDemographicData] =
		useState<DemographicBreakdown | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [activeTab, setActiveTab] = useState<string>('all-time');

	// Fetch leaderboard data
	useEffect(() => {
		const fetchData = async () => {
			setIsLoading(true);
			try {
				const result = await getAllTimeLeaderboard(filters);
				if (result.success && result.data) {
					setLeaderboardData(result.data);
				}
			} catch (error) {
				console.error('Failed to fetch leaderboard:', error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchData();
	}, [filters]);

	// Fetch demographic data when on demographics tab
	useEffect(() => {
		const fetchDemographics = async () => {
			if (activeTab === 'demographics') {
				try {
					const result = await getDemographicBreakdown(filters);
					if (result.success && result.data) {
						setDemographicData(result.data);
					}
				} catch (error) {
					console.error('Failed to fetch demographics:', error);
				}
			}
		};

		fetchDemographics();
	}, [activeTab, filters]);

	const handleFilterChange = (newFilters: {
		timeframe?: 'all' | 'week' | 'month' | 'today';
		category?: string;
		difficulty?: string;
		sex?: string;
		profession?: string;
		limit?: number;
	}) => {
		setFilters(newFilters as Filters);
	};

	const handleTabChange = (tab: string) => {
		setActiveTab(tab);

		// Update timeframe filter based on tab
		if (tab === 'all-time') {
			setFilters({ ...filters, timeframe: undefined });
		} else if (tab === 'weekly') {
			setFilters({ ...filters, timeframe: 'week' });
		} else if (tab === 'monthly') {
			setFilters({ ...filters, timeframe: 'month' });
		}
	};

	return (
		<DashboardShell>
			<DashboardHeader
				heading='Leaderboard'
				text='Compete with the best trivia players and climb to the top!'
			/>

			<Tabs
				value={activeTab}
				onValueChange={handleTabChange}
				className='space-y-4'
			>
				<TabsList className='grid w-full grid-cols-4'>
					<TabsTrigger value='all-time'>All Time</TabsTrigger>
					<TabsTrigger value='weekly'>Weekly</TabsTrigger>
					<TabsTrigger value='monthly'>Monthly</TabsTrigger>
					<TabsTrigger value='demographics'>Demographics</TabsTrigger>
				</TabsList>

				{/* All Time Leaderboard */}
				<TabsContent
					value='all-time'
					className='space-y-4'
				>
					<Card>
						<CardHeader>
							<CardTitle className='text-lg'>Filters</CardTitle>
							<CardDescription className='text-xs md:text-sm'>
								Customize your leaderboard view
							</CardDescription>
						</CardHeader>
						<CardContent>
							<LeaderboardFilters
								onFilterChange={handleFilterChange}
								showDemographicFilters={false}
							/>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className='flex items-center gap-2'>
								<Trophy className='h-5 w-5 text-yellow-500' />
								All-Time Champions
							</CardTitle>
							<CardDescription>
								Top {leaderboardData?.entries.length || 0} of{' '}
								{leaderboardData?.totalPlayers || 0} players
							</CardDescription>
						</CardHeader>
						<CardContent>
							{isLoading ? (
								<div className='py-12 text-center text-muted-foreground'>
									Loading leaderboard...
								</div>
							) : leaderboardData ? (
								<LeaderboardTable
									entries={leaderboardData.entries}
									currentUserId={
										leaderboardData.userEntry?.userId || ''
									}
									showProfession={true}
								/>
							) : (
								<div className='py-12 text-center text-muted-foreground'>
									No data available
								</div>
							)}
						</CardContent>
					</Card>

					{/* User Rank Card */}
					{leaderboardData?.userEntry && (
						<Card>
							<CardHeader>
								<CardTitle className='text-base'>
									Your Ranking
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
									<div className='space-y-1'>
										<p className='text-xs text-muted-foreground'>
											Rank
										</p>
										<p className='text-2xl font-bold'>
											#{leaderboardData.userEntry.rank}
										</p>
									</div>
									<div className='space-y-1'>
										<p className='text-xs text-muted-foreground'>
											Total Score
										</p>
										<p className='text-2xl font-bold'>
											{leaderboardData.userEntry.totalScore.toLocaleString()}
										</p>
									</div>
									<div className='space-y-1'>
										<p className='text-xs text-muted-foreground'>
											Games Played
										</p>
										<p className='text-2xl font-bold'>
											{
												leaderboardData.userEntry
													.gamesPlayed
											}
										</p>
									</div>
									<div className='space-y-1'>
										<p className='text-xs text-muted-foreground'>
											Avg Score
										</p>
										<p className='text-2xl font-bold'>
											{Math.round(
												leaderboardData.userEntry
													.averageScore
											)}
										</p>
									</div>
								</div>
							</CardContent>
						</Card>
					)}
				</TabsContent>

				{/* Weekly Leaderboard */}
				<TabsContent
					value='weekly'
					className='space-y-4'
				>
					<Card>
						<CardHeader>
							<CardTitle className='text-lg'>Filters</CardTitle>
							<CardDescription className='text-xs md:text-sm'>
								Customize your leaderboard view
							</CardDescription>
						</CardHeader>
						<CardContent>
							<LeaderboardFilters
								onFilterChange={handleFilterChange}
								showDemographicFilters={false}
							/>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className='flex items-center gap-2'>
								<TrendingUp className='h-5 w-5 text-blue-500' />
								This Week's Champions
							</CardTitle>
							<CardDescription>
								Top performers from the last 7 days
							</CardDescription>
						</CardHeader>
						<CardContent>
							{isLoading ? (
								<div className='py-12 text-center text-muted-foreground'>
									Loading leaderboard...
								</div>
							) : leaderboardData ? (
								<LeaderboardTable
									entries={leaderboardData.entries}
									currentUserId={
										leaderboardData.userEntry?.userId || ''
									}
									showProfession={true}
								/>
							) : (
								<div className='py-12 text-center text-muted-foreground'>
									No data available
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				{/* Monthly Leaderboard */}
				<TabsContent
					value='monthly'
					className='space-y-4'
				>
					<Card>
						<CardHeader>
							<CardTitle className='text-lg'>Filters</CardTitle>
							<CardDescription className='text-xs md:text-sm'>
								Customize your leaderboard view
							</CardDescription>
						</CardHeader>
						<CardContent>
							<LeaderboardFilters
								onFilterChange={handleFilterChange}
								showDemographicFilters={false}
							/>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className='flex items-center gap-2'>
								<Target className='h-5 w-5 text-green-500' />
								This Month's Champions
							</CardTitle>
							<CardDescription>
								Top performers from the last 30 days
							</CardDescription>
						</CardHeader>
						<CardContent>
							{isLoading ? (
								<div className='py-12 text-center text-muted-foreground'>
									Loading leaderboard...
								</div>
							) : leaderboardData ? (
								<LeaderboardTable
									entries={leaderboardData.entries}
									currentUserId={
										leaderboardData.userEntry?.userId || ''
									}
									showProfession={true}
								/>
							) : (
								<div className='py-12 text-center text-muted-foreground'>
									No data available
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				{/* Demographics Tab */}
				<TabsContent
					value='demographics'
					className='space-y-4'
				>
					<Card>
						<CardHeader>
							<CardTitle className='flex items-center gap-2'>
								<Users className='h-5 w-5 text-purple-500' />
								Demographic Breakdown
							</CardTitle>
							<CardDescription>
								Performance statistics across different
								demographics
							</CardDescription>
						</CardHeader>
						<CardContent className='space-y-6'>
							{demographicData ? (
								<>
									{/* By Sex */}
									<div>
										<h3 className='font-semibold mb-3'>
											By Sex
										</h3>
										<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'>
											{demographicData.bySex.map(
												(item) => (
													<Card key={item.sex}>
														<CardContent className='pt-4'>
															<p className='text-sm font-medium mb-2'>
																{item.sex}
															</p>
															<div className='space-y-1 text-xs text-muted-foreground'>
																<p>
																	Players:{' '}
																	{item.count}
																</p>
																<p>
																	Avg Score:{' '}
																	{Math.round(
																		item.averageScore
																	)}
																</p>
																{item.topPlayer && (
																	<p className='font-semibold text-foreground'>
																		Top:{' '}
																		{
																			item
																				.topPlayer
																				.name
																		}{' '}
																		(
																		{
																			item
																				.topPlayer
																				.score
																		}
																		)
																	</p>
																)}
															</div>
														</CardContent>
													</Card>
												)
											)}
										</div>
									</div>

									{/* By Profession */}
									<div>
										<h3 className='font-semibold mb-3'>
											Top 10 Professions
										</h3>
										<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'>
											{demographicData.byProfession.map(
												(item) => (
													<Card key={item.profession}>
														<CardContent className='pt-4'>
															<p className='text-sm font-medium mb-2'>
																{
																	item.profession
																}
															</p>
															<div className='space-y-1 text-xs text-muted-foreground'>
																<p>
																	Players:{' '}
																	{item.count}
																</p>
																<p>
																	Avg Score:{' '}
																	{Math.round(
																		item.averageScore
																	)}
																</p>
																{item.topPlayer && (
																	<p className='font-semibold text-foreground'>
																		Top:{' '}
																		{
																			item
																				.topPlayer
																				.name
																		}{' '}
																		(
																		{
																			item
																				.topPlayer
																				.score
																		}
																		)
																	</p>
																)}
															</div>
														</CardContent>
													</Card>
												)
											)}
										</div>
									</div>

									{/* By Category */}
									<div>
										<h3 className='font-semibold mb-3'>
											By Category
										</h3>
										<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'>
											{demographicData.byCategory.map(
												(item) => (
													<Card key={item.category}>
														<CardContent className='pt-4'>
															<p className='text-sm font-medium mb-2'>
																{item.category.replace(
																	'_',
																	' '
																)}
															</p>
															<div className='space-y-1 text-xs text-muted-foreground'>
																<p>
																	Responses:{' '}
																	{item.count}
																</p>
																<p>
																	Avg Score:{' '}
																	{Math.round(
																		item.averageScore
																	)}
																</p>
																{item.topPlayer && (
																	<p className='font-semibold text-foreground'>
																		Top:{' '}
																		{
																			item
																				.topPlayer
																				.name
																		}{' '}
																		(
																		{
																			item
																				.topPlayer
																				.score
																		}
																		)
																	</p>
																)}
															</div>
														</CardContent>
													</Card>
												)
											)}
										</div>
									</div>

									{/* By Difficulty */}
									<div>
										<h3 className='font-semibold mb-3'>
											By Difficulty
										</h3>
										<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3'>
											{demographicData.byDifficulty.map(
												(item) => (
													<Card key={item.difficulty}>
														<CardContent className='pt-4'>
															<p className='text-sm font-medium mb-2'>
																{
																	item.difficulty
																}
															</p>
															<div className='space-y-1 text-xs text-muted-foreground'>
																<p>
																	Responses:{' '}
																	{item.count}
																</p>
																<p>
																	Avg Score:{' '}
																	{Math.round(
																		item.averageScore
																	)}
																</p>
																{item.topPlayer && (
																	<p className='font-semibold text-foreground'>
																		Top:{' '}
																		{
																			item
																				.topPlayer
																				.name
																		}{' '}
																		(
																		{
																			item
																				.topPlayer
																				.score
																		}
																		)
																	</p>
																)}
															</div>
														</CardContent>
													</Card>
												)
											)}
										</div>
									</div>
								</>
							) : (
								<div className='py-12 text-center text-muted-foreground'>
									Loading demographic data...
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</DashboardShell>
	);
}
