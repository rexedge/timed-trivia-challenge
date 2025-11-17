'use client';

import Link from 'next/link';
import {
	ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaginationButtonProps {
	currentPage: number;
	totalPages: number;
	baseUrl: string;
}

export function PaginationButton({
	currentPage,
	totalPages,
	baseUrl,
}: PaginationButtonProps) {
	// Generate page numbers to show
	const getPageNumbers = () => {
		const pages = [];
		const maxPagesToShow = 5;

		if (totalPages <= maxPagesToShow) {
			// Show all pages if total pages is less than max pages to show
			for (let i = 1; i <= totalPages; i++) {
				pages.push(i);
			}
		} else {
			// Always show first page
			pages.push(1);

			// Calculate start and end of page range
			let start = Math.max(2, currentPage - 1);
			let end = Math.min(totalPages - 1, currentPage + 1);

			// Adjust range if at start or end
			if (currentPage <= 2) {
				end = 4;
			}
			if (currentPage >= totalPages - 1) {
				start = totalPages - 3;
			}

			// Add ellipsis if needed
			if (start > 2) {
				pages.push(-1); // -1 represents ellipsis
			}

			// Add page numbers
			for (let i = start; i <= end; i++) {
				pages.push(i);
			}

			// Add ellipsis if needed
			if (end < totalPages - 1) {
				pages.push(-1);
			}

			// Always show last page
			pages.push(totalPages);
		}

		return pages;
	};

	const pageNumbers = getPageNumbers();

	return (
		<div className='flex items-center space-x-2'>
			{/* First page button */}
			{currentPage === 1 ? (
				<Button
					variant='outline'
					size='icon'
					disabled
				>
					<ChevronsLeft className='h-4 w-4' />
					<span className='sr-only'>First page</span>
				</Button>
			) : (
				<Button
					variant='outline'
					size='icon'
					asChild
				>
					<Link href={`${baseUrl}?page=1`}>
						<ChevronsLeft className='h-4 w-4' />
						<span className='sr-only'>First page</span>
					</Link>
				</Button>
			)}

			{/* Previous page button */}
			{currentPage === 1 ? (
				<Button
					variant='outline'
					size='icon'
					disabled
				>
					<ChevronLeft className='h-4 w-4' />
					<span className='sr-only'>Previous page</span>
				</Button>
			) : (
				<Button
					variant='outline'
					size='icon'
					asChild
				>
					<Link href={`${baseUrl}?page=${currentPage - 1}`}>
						<ChevronLeft className='h-4 w-4' />
						<span className='sr-only'>Previous page</span>
					</Link>
				</Button>
			)}

			{pageNumbers.map((pageNumber, i) =>
				pageNumber === -1 ? (
					<Button
						key={`ellipsis-${i}`}
						variant='outline'
						size='icon'
						disabled
					>
						...
					</Button>
				) : (
					<Button
						key={pageNumber}
						variant={
							currentPage === pageNumber ? 'default' : 'outline'
						}
						size='icon'
						asChild
					>
						<Link href={`${baseUrl}?page=${pageNumber}`}>
							{pageNumber}
						</Link>
					</Button>
				)
			)}

			{/* Next page button */}
			{currentPage >= totalPages || totalPages === 0 ? (
				<Button
					variant='outline'
					size='icon'
					disabled
				>
					<ChevronRight className='h-4 w-4' />
					<span className='sr-only'>Next page</span>
				</Button>
			) : (
				<Button
					variant='outline'
					size='icon'
					asChild
				>
					<Link href={`${baseUrl}?page=${currentPage + 1}`}>
						<ChevronRight className='h-4 w-4' />
						<span className='sr-only'>Next page</span>
					</Link>
				</Button>
			)}

			{/* Last page button */}
			{currentPage >= totalPages || totalPages === 0 ? (
				<Button
					variant='outline'
					size='icon'
					disabled
				>
					<ChevronsRight className='h-4 w-4' />
					<span className='sr-only'>Last page</span>
				</Button>
			) : (
				<Button
					variant='outline'
					size='icon'
					asChild
				>
					<Link href={`${baseUrl}?page=${totalPages}`}>
						<ChevronsRight className='h-4 w-4' />
						<span className='sr-only'>Last page</span>
					</Link>
				</Button>
			)}
		</div>
	);
}
