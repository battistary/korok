<script>
	import * as Card from '$lib/components/ui/card/';
	import { ArrowDown01, ArrowUp01, SearchIcon, Trophy } from 'lucide-svelte';
	import { getUserFinds } from '../query/korok.remote';
	import { Toggle } from '$lib/components/ui/toggle/';
	import Input from '#lib/components/ui/input/input.svelte';
	import * as InputGroup from '$lib/components/ui/input-group/';

	let players = await getUserFinds();
	let sortDir = $state('desc');
	let filterValue = $state('');
	let sortedPlayers = $derived(
		[...players]
			.sort((a, b) => {
				let el1 = sortDir === 'asc' ? a : b;
				let el2 = sortDir === 'asc' ? b : a;
				return el1.koroksFound - el2.koroksFound;
			})
			.filter((player) => player.user.name.includes(filterValue))
	);
</script>

<div class="mx-auto max-w-4xl px-4 py-8">
	<!-- Header -->
	<div class="mb-8 text-center">
		<h1 class="text-5xl font-black tracking-tight text-foreground">Hunter Leaderboard</h1>

		<p class="mt-2 text-lg text-muted-foreground">The greatest Korok hunters</p>
	</div>

	<!-- Leaderboard -->
	<Card.Root class="overflow-hidden border-2 border-border bg-card pt-0 shadow-lg">
		<Card.Header class="border-b-2 border-border bg-secondary/60 px-6 py-5">
			<div class="flex items-center justify-between">
				<div>
					<Card.Title class="text-2xl font-black">
						<Trophy class="inline" /> Hunter Rankings
					</Card.Title>

					<Card.Description class="mt-1">Ranked by Koroks found</Card.Description>
				</div>

				<div class="flex flex-col items-end gap-2">
					<div class="grow rounded-full border-2 border-border bg-background px-4 py-2 font-bold">
						{sortedPlayers.length} Hunter{sortedPlayers.length !== 1 ? 's' : ''}
					</div>
					<div class="flex gap-2">
						<InputGroup.Root class="w-50 bg-background">
							<InputGroup.Input bind:value={filterValue} placeholder="Search..." />
							<InputGroup.Addon>
								<SearchIcon />
							</InputGroup.Addon>
						</InputGroup.Root>
						<Toggle
							class="hover:bg-primary-100 w-8 bg-primary font-bold text-primary-foreground aria-pressed:bg-primary"
							variant="outline"
                            pressed={sortDir === 'desc'}
							onPressedChange={(e) => (sortDir = e ? 'desc' : 'asc')}
						>
                            {#if sortDir === 'desc'}<ArrowDown01 />{:else}<ArrowUp01 />{/if}
						</Toggle>
					</div>
				</div>
			</div>
		</Card.Header>

		<Card.Content class="p-4 sm:p-6">
			<div class="flex flex-col gap-3">
				{#each sortedPlayers as player, index (player.user.id)}
					{@const rank = index + 1}

					<div
						class={`group relative overflow-hidden rounded-xl border-2 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                            "bg-secondary/60"
						}`}
					>
						<div class="flex items-center gap-4">
							<!-- Rank -->
							<div
								class={`flex size-12 shrink-0 items-center justify-center rounded-full border-2 text-xl font-black ${
									rank === 1
										? 'border-yellow-600 bg-yellow-400/30 text-yellow-800'
										: rank === 2
											? 'border-slate-400 bg-slate-300/40 text-slate-700'
											: rank === 3
												? 'border-orange-700 bg-orange-400/30 text-orange-800'
												: 'border-border bg-card text-muted-foreground'
								}`}
							>
                            <div class="font-[hylia]">
								#{rank}
                            </div>
							</div>

							<!-- Player -->
							<div class="min-w-0 flex-1">
								<p class="truncate text-xl font-[hylia] text-foreground">
									{player.user.name}
								</p>

								{#if player.lastFoundAt}
									<p class="mt-0.5 text-sm text-muted-foreground">
										Last find:
										{player.lastFoundAt.toLocaleString()}
									</p>
								{:else}
									<p class="mt-0.5 text-sm text-muted-foreground">No Koroks found</p>
								{/if}
							</div>

							<!-- Score -->
							<div class="shrink-0 text-right">
								<p class="text-3xl font-black text-primary">
									{player.koroksFound}
								</p>

								<p class="text-sm font-semibold text-muted-foreground">
									{player.koroksFound === 1 ? 'Korok' : 'Koroks'}
								</p>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</Card.Content>
	</Card.Root>
</div>
