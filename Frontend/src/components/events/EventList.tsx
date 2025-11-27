import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { Event } from '../../types';
import { eventService } from '../../services/eventService';
import EventCard from './EventCard';


interface EventListProps {
	events?: Event[];
	loading?: boolean;
	showFilters?: boolean;
}

const DATE_FILTERS = ['Any Date', 'Today', 'This Week', 'This Month', 'Next Month'] as const;

const EventList: React.FC<EventListProps> = ({
	events: propEvents,
	loading: propLoading = false,
	showFilters = true
}) => {
	const [events, setEvents] = useState<Event[]>(propEvents || []);
	const [loading, setLoading] = useState(propLoading);
	const [error, setError] = useState<string | null>(null);
	const [searchInput, setSearchInput] = useState('');
	const [searchQuery, setSearchQuery] = useState('');
	const [category, setCategory] = useState('All Categories');
	const [location, setLocation] = useState('All Locations');
	const [dateFilter, setDateFilter] = useState<typeof DATE_FILTERS[number]>('Any Date');
	const [filtersOpen, setFiltersOpen] = useState(false);
	const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

	const derivedCategories = useMemo(() => {
		const unique = new Set<string>();
		events.forEach(evt => {
			if (evt.category) {
				unique.add(evt.category);
			}
		});
		return ['All Categories', ...Array.from(unique).sort()];
	}, [events]);

	const derivedLocations = useMemo(() => {
		const unique = new Set<string>();
		events.forEach(evt => {
			if (evt.location) {
				unique.add(evt.location);
			}
		});
		return ['All Locations', ...Array.from(unique).sort()];
	}, [events]);

	const fetchEvents = useCallback(async () => {
		if (propEvents) {
			return;
		}

		try {
			setLoading(true);
			setError(null);
			const data = await eventService.getEvents(category, searchQuery, location, dateFilter);
			setEvents(data);
		} catch (err) {
			console.error('Failed to fetch events:', err);
			setError('We could not load events right now. Please try again in a moment.');
		} finally {
			setLoading(false);
		}
	}, [propEvents, category, searchQuery, location, dateFilter]);

	useEffect(() => {
		if (propEvents) {
			setEvents(propEvents);
			setLoading(propLoading);
			return;
		}
		void fetchEvents();
	}, [propEvents, propLoading, fetchEvents]);

	const handleSearchSubmit = (event: React.FormEvent) => {
		event.preventDefault();
		setSearchQuery(searchInput.trim());
	};

	const handleResetFilters = () => {
		setSearchInput('');
		setSearchQuery('');
		setCategory('All Categories');
		setLocation('All Locations');
		setDateFilter('Any Date');
	};

	const filtersVisibleClass = filtersOpen ? 'grid' : 'hidden md:grid';

	return (
		<div className="space-y-12">
			{showFilters && (
				<section className="bg-white/85 border border-slate-200 shadow-lg shadow-slate-200/40 rounded-3xl p-6 md:p-8 backdrop-blur-sm">
					<div className="flex flex-col gap-6">
						<div className="flex flex-col md:flex-row md:items-center gap-4">
							<form onSubmit={handleSearchSubmit} className="flex-1">
								<div className="relative">
									<input
										type="search"
										value={searchInput}
										onChange={(e) => setSearchInput(e.target.value)}
										placeholder="Search by event name, speaker, or keyword"
										className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 pr-32 text-base text-slate-700 shadow-inner focus:border-sky-400 focus:outline-none focus:ring-4 focus:ring-sky-100"
									/>
									<button
										type="submit"
										className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:brightness-105"
									>
										Search
									</button>
								</div>
							</form>
							<button
								type="button"
								onClick={() => setFiltersOpen(prev => !prev)}
								className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-sky-300 hover:text-slate-800 md:hidden"
								aria-expanded={filtersOpen}
							>
								Filters
								<svg
									className="ml-2 h-4 w-4"
									viewBox="0 0 20 20"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M4 7L10 13L16 7"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
							</button>
						</div>

						<div className={`${filtersVisibleClass} grid-cols-1 md:grid-cols-3 gap-4 md:gap-6`}>
							<label className="flex flex-col gap-2 text-sm font-semibold text-slate-600">
								Category
								<select
									value={category}
									onChange={(e) => setCategory(e.target.value)}
									className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-700 shadow-inner focus:border-sky-400 focus:outline-none focus:ring-4 focus:ring-sky-100"
								>
									{derivedCategories.map(option => (
										<option key={option} value={option}>
											{option}
										</option>
									))}
								</select>
							</label>

							<label className="flex flex-col gap-2 text-sm font-semibold text-slate-600">
								Date
								<select
									value={dateFilter}
									onChange={(e) => setDateFilter(e.target.value as typeof dateFilter)}
									className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-700 shadow-inner focus:border-sky-400 focus:outline-none focus:ring-4 focus:ring-sky-100"
								>
									{DATE_FILTERS.map(option => (
										<option key={option} value={option}>
											{option}
										</option>
									))}
								</select>
							</label>

							<label className="flex flex-col gap-2 text-sm font-semibold text-slate-600">
								Location
								<select
									value={location}
									onChange={(e) => setLocation(e.target.value)}
									className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-700 shadow-inner focus:border-sky-400 focus:outline-none focus:ring-4 focus:ring-sky-100"
								>
									{derivedLocations.map(option => (
										<option key={option} value={option}>
											{option}
										</option>
									))}
								</select>
							</label>
						</div>

						<div className="flex flex-wrap items-center justify-between gap-4 text-sm text-slate-500">
							<p className="text-base text-slate-600">
								EventHub makes it simple to explore inspiring gatherings from the community. Pick a category, refine with filters, and discover something worth bookmarking today.
							</p>
							<button
								type="button"
								onClick={handleResetFilters}
								className="inline-flex items-center gap-2 rounded-xl border border-transparent bg-slate-100 px-4 py-2 font-medium text-slate-600 transition hover:bg-slate-200"
							>
								Reset
							</button>
						</div>
					</div>
				</section>
			)}

			{error && (
				<div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-600 shadow-sm">
					{error}
				</div>
			)}

			{loading ? (
				<div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
					{Array.from({ length: 6 }).map((_, index) => (
						<div
							key={index}
							className="animate-pulse rounded-3xl border border-slate-200 bg-white shadow-sm"
						>
							<div className="aspect-[16/10] rounded-t-3xl bg-slate-100" />
							<div className="space-y-4 p-6">
								<div className="h-5 w-2/3 rounded-full bg-slate-100" />
								<div className="h-4 w-1/2 rounded-full bg-slate-100" />
								<div className="h-10 w-28 rounded-full bg-slate-100" />
							</div>
						</div>
					))}
				</div>
			) : events.length === 0 ? (
				<div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
					<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-3xl">📅</div>
					<h3 className="text-xl font-semibold text-slate-700">No events match your filters yet</h3>
					<p className="mt-2 text-slate-500">Try broadening your search or resetting the filters to see everything that is currently available.</p>
				</div>
			) : (
				<div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
					{events.map(event => (
						<EventCard
							key={event.id}
							event={event}
							onEdit={() => setSelectedEvent(event)}
						/>
					))}
				</div>
			)}

			{selectedEvent && (
				<div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
					<div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
						{/* Header with Event Image */}
						<div className="relative h-80 overflow-hidden rounded-t-3xl">
							{selectedEvent.imageUrl ? (
								<img
									src={selectedEvent.imageUrl}
									alt={selectedEvent.name}
									className="w-full h-full object-cover"
								/>
							) : (
								<div className="w-full h-full bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center">
									<div className="text-center">
										<svg className="w-20 h-20 mx-auto mb-4 text-slate-400 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
										</svg>
										<h2 className="text-2xl font-bold text-slate-400">{selectedEvent.category}</h2>
									</div>
								</div>
							)}

							{/* Overlay with gradient */}
							<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>

							{/* Close button */}
							<button
								onClick={() => setSelectedEvent(null)}
								className="absolute top-6 right-6 text-white hover:text-slate-200 transition-all duration-200 bg-black/20 hover:bg-black/40 rounded-full p-2 backdrop-blur-sm"
								aria-label="Close"
							>
								<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>

							{/* Event title */}
							<div className="absolute bottom-6 left-6 right-6">
								<h1 className="text-4xl font-bold text-white leading-tight drop-shadow-lg">{selectedEvent.name}</h1>
							</div>
						</div>

						{/* Content */}
						<div className="p-8 space-y-8">
							{/* Description */}
							<div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
								<h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-3">
									<svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
									About this event
								</h2>
								<p className="text-slate-600 leading-relaxed text-lg">{selectedEvent.description}</p>
							</div>

							{/* Event Details Grid */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								{/* Left Column */}
								<div className="space-y-6">
									<div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
										<div className="flex items-center gap-3 mb-3">
											<div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
												<svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
												</svg>
											</div>
											<h3 className="text-xl font-bold text-slate-800">Location</h3>
										</div>
										<p className="text-slate-600 text-lg">{selectedEvent.location}</p>
									</div>

									<div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
										<div className="flex items-center gap-3 mb-3">
											<div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
												<svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
												</svg>
											</div>
											<h3 className="text-xl font-bold text-slate-800">Date & Time</h3>
										</div>
										<p className="text-slate-600 text-lg">{new Date(selectedEvent.date).toLocaleDateString('en-US', {
											weekday: 'long',
											year: 'numeric',
											month: 'long',
											day: 'numeric',
											hour: '2-digit',
											minute: '2-digit'
										})}</p>
									</div>
								</div>

								{/* Right Column */}
								<div className="space-y-6">
									<div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
										<div className="flex items-center gap-3 mb-3">
											<div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
												<svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
												</svg>
											</div>
											<h3 className="text-xl font-bold text-slate-800">Category</h3>
										</div>
										<p className="text-slate-600 text-lg">{selectedEvent.category}</p>
									</div>

									<div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
										<div className="flex items-center gap-3 mb-3">
											<div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
												<svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
												</svg>
											</div>
											<h3 className="text-xl font-bold text-slate-800">Event ID</h3>
										</div>
										<p className="text-slate-600 text-lg">#{selectedEvent.id}</p>
									</div>
								</div>
							</div>

							{/* Action Buttons */}
							<div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-200">
								<button className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-4 rounded-2xl font-bold text-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]">
									🎫 Book Tickets Now
								</button>
								<button className="px-8 py-4 border border-slate-300 text-slate-700 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all duration-300">
									📤 Share Event
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default EventList;
