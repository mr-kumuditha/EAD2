import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { Event } from '../../types';
import { eventService } from '../../services/eventService';

const DATE_FILTERS = ['Any Date', 'Today', 'This Week', 'This Month', 'Next Month'] as const;

const formatEventDate = (dateString: string) => {
	const date = new Date(dateString);
	return new Intl.DateTimeFormat('en-US', {
		weekday: 'short',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	}).format(date);
};

const EventDetail: React.FC = () => {
	const [events, setEvents] = useState<Event[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [searchInput, setSearchInput] = useState('');
	const [searchQuery, setSearchQuery] = useState('');
	const [category, setCategory] = useState('All Categories');
	const [location, setLocation] = useState('All Locations');
	const [dateFilter, setDateFilter] = useState<typeof DATE_FILTERS[number]>('Any Date');
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
	}, [category, searchQuery, location, dateFilter]);

	useEffect(() => {
		void fetchEvents();
	}, [fetchEvents]);

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

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
			{/* Hero Section with Search and Filters */}
			<section className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white py-20 px-4">
				<div className="absolute inset-0 bg-black/10"></div>
				<div className="relative max-w-7xl mx-auto">
					<div className="text-center mb-12">
						<h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
							Discover Amazing Events
						</h1>
						<p className="text-xl md:text-2xl text-slate-200 max-w-3xl mx-auto leading-relaxed">
							Find and book tickets for the best events happening around you. From concerts to conferences, we've got something for everyone.
						</p>
					</div>

					{/* Search and Filter Section */}
					<div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-10 border border-white/20">
						<form onSubmit={handleSearchSubmit} className="mb-8">
							<div className="relative">
								<input
									type="search"
									value={searchInput}
									onChange={(e) => setSearchInput(e.target.value)}
									placeholder="Search by event name, speaker, or keyword..."
									className="w-full rounded-2xl border-0 bg-slate-50 px-6 py-5 pr-36 text-lg text-slate-700 shadow-inner focus:ring-4 focus:ring-indigo-200 focus:outline-none"
								/>
								<button
									type="submit"
									className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-3 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
								>
									Search
								</button>
							</div>
						</form>

						{/* Filter Options */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							<div className="space-y-2">
								<label htmlFor="category-select" className="block text-sm font-semibold text-slate-700">Category</label>
								<select
									id="category-select"
									value={category}
									onChange={(e) => setCategory(e.target.value)}
									className="w-full rounded-2xl border-0 bg-slate-50 px-4 py-3 text-slate-700 shadow-inner focus:ring-4 focus:ring-indigo-200 focus:outline-none"
								>
									{derivedCategories.map(option => (
										<option key={option} value={option}>
											{option}
										</option>
									))}
								</select>
							</div>

							<div className="space-y-2">
								<label htmlFor="date-select" className="block text-sm font-semibold text-slate-700">Date</label>
								<select
									id="date-select"
									value={dateFilter}
									onChange={(e) => setDateFilter(e.target.value as typeof dateFilter)}
									className="w-full rounded-2xl border-0 bg-slate-50 px-4 py-3 text-slate-700 shadow-inner focus:ring-4 focus:ring-indigo-200 focus:outline-none"
								>
									{DATE_FILTERS.map(option => (
										<option key={option} value={option}>
											{option}
										</option>
									))}
								</select>
							</div>

							<div className="space-y-2">
								<label htmlFor="location-select" className="block text-sm font-semibold text-slate-700">Location</label>
								<select
									id="location-select"
									value={location}
									onChange={(e) => setLocation(e.target.value)}
									className="w-full rounded-2xl border-0 bg-slate-50 px-4 py-3 text-slate-700 shadow-inner focus:ring-4 focus:ring-indigo-200 focus:outline-none"
								>
									{derivedLocations.map(option => (
										<option key={option} value={option}>
											{option}
										</option>
									))}
								</select>
							</div>
						</div>

						<div className="flex justify-end mt-6">
							<button
								type="button"
								onClick={handleResetFilters}
								className="px-6 py-2 text-slate-600 hover:text-slate-800 font-medium transition-colors duration-200"
							>
								Reset Filters
							</button>
						</div>
					</div>
				</div>
			</section>

			{/* Events Grid Section */}
			<section className="py-16 px-4">
				<div className="max-w-7xl mx-auto">
					{/* Error Message */}
					{error && (
						<div className="mb-12 p-6 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-center shadow-sm">
							{error}
						</div>
					)}

					{/* Loading State */}
					{loading ? (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
							{Array.from({ length: 6 }).map((_, index) => (
								<div
									key={index}
									className="animate-pulse bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden"
								>
									<div className="aspect-[4/3] bg-slate-200" />
									<div className="p-6 space-y-4">
										<div className="h-6 bg-slate-200 rounded-full w-3/4" />
										<div className="h-4 bg-slate-200 rounded-full w-1/2" />
										<div className="h-4 bg-slate-200 rounded-full w-2/3" />
										<div className="h-10 bg-slate-200 rounded-2xl w-full" />
									</div>
								</div>
							))}
						</div>
					) : events.length === 0 ? (
						<div className="text-center py-20">
							<div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
								<svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
								</svg>
							</div>
							<h3 className="text-2xl font-semibold text-slate-700 mb-2">No events found</h3>
							<p className="text-slate-500 mb-6">Try adjusting your search or filter criteria.</p>
							<button
								onClick={handleResetFilters}
								className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-50 text-indigo-600 rounded-2xl font-semibold hover:bg-indigo-100 transition-colors duration-200"
							>
								Clear Filters
							</button>
						</div>
					) : (
						<>
							{/* Results Count */}
							<div className="flex items-center justify-between mb-12">
								<h2 className="text-3xl font-bold text-slate-800">
									{events.length} event{events.length !== 1 ? 's' : ''} found
								</h2>
								<div className="flex items-center gap-2 text-slate-500">
									<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
									</svg>
									<span className="font-medium">Live Events</span>
								</div>
							</div>

							{/* Events Grid */}
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
								{events.map(event => (
									<article
										key={event.id}
										className="group bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
									>
										{/* Event Image */}
										<div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
											{event.imageUrl ? (
												<img
													src={event.imageUrl}
													alt={event.name}
													className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
												/>
											) : (
												<div className="flex h-full w-full items-center justify-center">
													<div className="text-center text-slate-400">
														<svg className="w-16 h-16 mx-auto mb-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
														</svg>
														<p className="text-sm font-medium">{event.category}</p>
													</div>
												</div>
											)}

											{/* Date Badge */}
											<div className="absolute top-4 left-4">
												<span className="bg-white/95 backdrop-blur-sm text-slate-700 px-3 py-1.5 rounded-full text-sm font-semibold shadow-sm">
													{formatEventDate(event.date)}
												</span>
											</div>
										</div>

										{/* Event Content */}
										<div className="p-6 space-y-4">
											<div>
												<h3 className="text-xl font-bold text-slate-800 mb-2 line-clamp-2 leading-tight">
													{event.name}
												</h3>
												<p className="text-slate-500 font-medium">{event.category}</p>
											</div>

											{/* Location */}
											<div className="flex items-center gap-2 text-slate-600">
												<svg className="w-5 h-5 text-indigo-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
												</svg>
												<span className="text-sm line-clamp-1">{event.location}</span>
											</div>

											{/* View Details Button */}
											<button
												onClick={() => setSelectedEvent(event)}
												className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3 px-6 rounded-2xl font-semibold hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
											>
												View Details
											</button>
										</div>
									</article>
								))}
							</div>
						</>
					)}
				</div>
			</section>

			{/* Event Detail Modal */}
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

export default EventDetail;
