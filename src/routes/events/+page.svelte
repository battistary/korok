<script lang="ts">
	import * as Card from '$lib/components/ui/card/';
	import { getEvents } from '../query/korok.remote';
	import { Calendar } from 'lucide-svelte';

	let events = await getEvents();
</script>

<div class="mx-auto max-w-4xl px-4 py-8">
	<div class="mb-8 text-center">
		<h1 class="text-5xl font-black tracking-tight text-foreground">Korok Events</h1>
		<p class="mt-2 text-lg text-muted-foreground">Special Korok hunts and limited-time challenges</p>
	</div>

	<Card.Root class="overflow-hidden border-2 border-border bg-card pt-0 shadow-lg">
		<Card.Header class="-m-px border-b-2 border-border bg-secondary/60 px-6 py-5">
			<Card.Title class="text-2xl font-black">Event Hunts</Card.Title>
			<Card.Description class="mt-1">
				Browse current and past events
			</Card.Description>
		</Card.Header>

		<Card.Content class="p-4 sm:p-6">
			<div class="flex flex-col gap-3">
				{#each events as event (event.id)}
					<a href={`/events/${event.id}`}>
						<div
							class="group relative overflow-hidden rounded-xl border-2 border-border/70 bg-secondary/60 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary hover:shadow-md"
						>
							{#if event.backgroundImage}
								<img
									src={event.backgroundImage}
									alt=""
									class="pt-4 mx-auto w-auto object-fill"
								/>
							{/if}

							<div class="p-4">
								<div class="flex items-center justify-between gap-4">
									<div class="min-w-0 flex-1">
										<h3 class="text-2xl font-black text-foreground">
											{event.name}
										</h3>
										<p class="mt-1 text-sm text-muted-foreground">
											{event.description}
										</p>
									</div>
                                    <span
                                        class={`shrink-0 rounded-full border-2 px-3 py-1 text-sm font-black ${
event.isActive
? 'border-primary/40 bg-primary/15 text-primary'
: 'border-border bg-card text-muted-foreground'
}`}
                                    >
                                        {event.isActive ? 'Active' : 'Inactive'}
                                    </span>
								</div>

								<p class="mt-2 flex items-center gap-2 text-sm font-bold text-muted-foreground">
									<Calendar class="size-4" /> View event leaderboard & stats →
								</p>
							</div>
						</div>
					</a>
				{/each}

				{#if events.length === 0}
					<div class="rounded-xl border-2 border-dashed border-border p-12 text-center">
						<p class="text-lg font-bold text-foreground">No events yet</p>
						<p class="mt-1 text-sm text-muted-foreground">Check back later for upcoming events!</p>
					</div>
				{/if}
			</div>
		</Card.Content>
	</Card.Root>

	<section>
		<br />
		<p style="text-align: center" class="mt-1">
			Made by RPI students, for RPI students.<br />
			Not endorsed or sponsored by Rensselaer Polytechnic Institute.<br />
			The code for this website can be found
			<a
				style="text-decoration: underline;"
				class="text-primary"
				href="https://github.com/battistary/korok">here</a
			>.
		</p>
	</section>
</div>
