<script lang="ts">
	import * as Card from '$lib/components/ui/card/';
	import { Toggle } from '$lib/components/ui/toggle/';
	import * as InputGroup from '$lib/components/ui/input-group/';
	import { ArrowDown01, ArrowUp01, Crown, SearchIcon } from 'lucide-svelte';
	import { korokImageSrc, tripleNumber } from '$lib/utils';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	// `data` is replaced on every navigation, so $derived keeps these in sync.
	let event = $derived(data.event);
	let players = $derived(data.players);
	let koroks = $derived(data.koroks);
	let foundIds = $derived(data.foundIds);

	// Leaderboard ranking — canonical, direction-agnostic
	let rankedPlayers = $derived(players.map((player, i) => ({ player, rank: i + 1 })));

	// Leaderboard display order
	let playerSortDir = $state('desc');
	let playerFilterValue = $state('');
	let sortedPlayers = $derived.by(() => {
		let all = [...rankedPlayers];
		if (playerSortDir === 'asc') all.sort((a, b) => b.rank - a.rank);
		return all.filter(({ player }) =>
			player.user.name.toLowerCase().includes(playerFilterValue.toLowerCase())
		);
	});

	// Korok stats sorting
	let korokSortMode = $state('Number');
	let korokSortDir = $state('asc');
	let sortedKoroks = $derived(
		[...koroks].sort((a, b) => {
			let el1 = korokSortDir === 'asc' ? a : b;
			let el2 = korokSortDir === 'asc' ? b : a;
			if (korokSortMode === 'Number') {
				return el1.korok.number - el2.korok.number;
			}
			if (korokSortMode === 'Finds') {
				return el2.findCount - el1.findCount;
			}
			return 0;
		})
	);

	const formatLastFind = (d: Date) =>
		`${d.toLocaleDateString([], { month: 'numeric', day: 'numeric' })} at ${d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
</script>

{#if !event}
	<div class="mx-auto max-w-4xl px-4 py-8 text-center">
		<h1 class="text-5xl font-black tracking-tight text-foreground">Event not found</h1>
		<p class="mt-2 text-lg text-muted-foreground">
			This event does not exist or has been removed.
		</p>
	</div>
{:else}
	<div class="mx-auto max-w-4xl px-4 py-8">
		<!-- Header -->
		<div class="mb-8 text-center">
			<h1 class="text-5xl font-black tracking-tight text-foreground">{event.name}</h1>
			<p class="mt-2 text-lg text-muted-foreground">{event.description}</p>
			{#if event.isActive}
				<span
					class="mt-4 inline-block rounded-full border-2 border-primary/40 bg-primary/15 px-4 py-1 text-sm font-black text-primary"
				>
					Currently Active
				</span>
			{/if}
		</div>

		<!-- Leaderboard -->
		<Card.Root class="mb-8 overflow-hidden border-2 border-border bg-card pt-0 shadow-lg">
            <Card.Header class="-m-px border-b-2 border-border bg-secondary/60 px-6 py-5">
                <div class="flex items-center justify-between">
                    <div>
                        <Card.Title class="text-2xl font-black">
                            <div class="flex items-center gap-2">
                                <img alt="Hestu" src="/icons/hestu.png" class="h-12" />
                                <span>Event Rankings</span>
                            </div>
                        </Card.Title>

                        <Card.Description class="mt-1">
                            Ranked by most Event Koroks found
                            <br />
                        </Card.Description>
                    </div>

                    <div class="flex flex-col items-end gap-2">
                        <div class="grow rounded-full border-2 border-border bg-background px-3 py-2 font-bold">
                            {sortedPlayers.length} Hunter{sortedPlayers.length !== 1 ? 's' : ''}
                        </div>
                        <div class="flex w-30 flex-wrap justify-end gap-2 lg:w-50">
                            <InputGroup.Root class="bg-background">
                                <InputGroup.Input bind:value={playerFilterValue} placeholder="Search..." />
                                <InputGroup.Addon>
                                    <SearchIcon />
                                </InputGroup.Addon>
                            </InputGroup.Root>
                            <Toggle
                                class="hover:bg-primary-100 w-8 bg-primary font-bold text-primary-foreground aria-pressed:bg-primary"
                                variant="outline"
                                pressed={playerSortDir === 'desc'}
                                onPressedChange={(e) => (playerSortDir = e ? 'desc' : 'asc')}
                            >
                                {#if playerSortDir === 'desc'}<ArrowDown01 />{:else}<ArrowUp01 />{/if}
                            </Toggle>
                        </div>
                    </div>
                </div>
			</Card.Header>

			<Card.Content class="p-4 sm:p-6">
				<div class="flex flex-col gap-3">
					{#each sortedPlayers as { player, rank } (player.user.id)}
						<div
							class="group relative overflow-hidden rounded-xl border-2 border-border/70 bg-secondary/60 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary hover:shadow-md"
						>
							<div class="flex items-center">
								<!-- Rank -->
                                <div class="relative mr-4 shrink-0">
                                    {#if rank === 1}
                                        <Crown
                                            class="absolute -top-3 left-1/2 -translate-x-1/2 text-yellow-700 drop-shadow"
                                            size={26}
                                            fill="#facc15"
                                        />
                                    {/if}
                                    <div
                                        class={`flex size-15 items-center justify-center rounded-full border-2 p-1 font-[hylia] text-xl font-black ${
                                            rank === 1
                                                ? 'border-yellow-600 bg-yellow-400/30 text-yellow-800'
                                                : rank === 2
                                                    ? 'border-slate-400 bg-slate-300/40 text-slate-700'
                                                    : rank === 3
                                                        ? 'border-orange-700 bg-orange-400/30 text-orange-800'
                                                        : 'border-border bg-card text-muted-foreground'
                                        }`}
                                    >
                                        {#if player.user.icon}
                                            <img
                                                class="h-auto max-h-full max-w-full"
                                                src="/{player.user.icon}"
                                                alt={player.user.name}
                                            />
                                        {:else}
                                            #{rank}
                                        {/if}
                                    </div>
                                </div>

								<!-- Player -->
								<div class="min-w-0 flex-1">
									<p class="break-all font-[hylia] text-xl text-foreground">
										{player.user.name}
									</p>

									{#if player.user.subtext}
										<p class="mt-0.5 text-sm text-muted-foreground">
											{player.user.subtext}
										</p>
									{:else if player.lastFoundAt && player.lastKorokNumber != null}
										<p class="mt-0.5 text-sm text-muted-foreground">
											Last find: #{String(player.lastKorokNumber).padStart(3, '0')} on
											{formatLastFind(player.lastFoundAt)}
										</p>
									{:else}
										<p class="mt-0.5 text-sm text-muted-foreground">No Event Koroks found</p>
									{/if}
								</div>

								<!-- Score -->
								<div class="shrink-0 text-right">
									{#if player.user.subrole}
										<p class="truncate text-lg font-semibold text-muted-foreground">
											{player.user.subrole}
										</p>
									{:else}
                                        <p class="text-3xl font-black text-primary">
                                            {player.koroksFound}
                                        </p>
                                        <p class="text-sm font-semibold text-muted-foreground">
                                            {player.koroksFound === 1 ? 'Korok' : 'Koroks'}
                                        </p>
									{/if}
								</div>
							</div>
						</div>
					{/each}

					{#if sortedPlayers.length === 0}
						<div class="rounded-xl border-2 border-dashed border-border p-12 text-center">
							<p class="text-lg font-bold text-foreground">No one has found an Event Korok yet</p>
							<p class="mt-1 text-sm text-muted-foreground">Be the first!</p>
						</div>
					{/if}
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Event Korok Rankings -->
		<Card.Root class="overflow-hidden border-2 border-border bg-card pt-0 shadow-lg">
			<Card.Header class="-m-px border-b-2 border-border bg-secondary/60 px-6 py-5">
				<div class="flex items-center justify-between">
                    <div>
                        <div class="flex items-center gap-2">
                            <img class="w-10 h-9" src="/korok_seed_icon.png" alt="Korok seed" />
                            <Card.Title class="text-2xl font-black">Event Koroks</Card.Title>
                        </div>
                        <Card.Description class="mt-1">
                            Ranked by {korokSortMode === 'Number' ? 'Korok number' : 'number of finds'}
                        </Card.Description>
                    </div>
					<div class="flex flex-col items-end gap-2">
						<div class="grow rounded-full border-2 border-border bg-background px-4 py-2 font-bold">
							{sortedKoroks.length} Korok{sortedKoroks.length !== 1 ? 's' : ''}
						</div>
						<div class="flex gap-2">
							<Toggle
								class="hover:bg-primary-100 w-20 bg-primary font-bold text-primary-foreground aria-pressed:bg-primary"
								variant="outline"
								onPressedChange={(e) => (korokSortMode = e ? 'Finds' : 'Number')}
							>
								{korokSortMode}
							</Toggle>
							<Toggle
								class="hover:bg-primary-100 w-8 bg-primary font-bold text-primary-foreground aria-pressed:bg-primary"
								variant="outline"
								onPressedChange={(e) => (korokSortDir = e ? 'desc' : 'asc')}
							>
								{#if korokSortDir === 'desc'}<ArrowUp01 />{:else}<ArrowDown01 />{/if}
							</Toggle>
						</div>
					</div>
				</div>
			</Card.Header>

			<Card.Content class="p-4 sm:p-6">
				<div class="flex flex-col gap-3">
					{#each sortedKoroks as korok (korok.korok.id)}
						<div
							class="group relative overflow-hidden rounded-xl border-2 border-border/70 bg-secondary/60 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary hover:shadow-md"
						>
							<div class="relative flex items-center gap-4">
								<div
									class="flex size-15 shrink-0 items-center justify-center rounded-full border-2 border-border bg-card p-1 font-black"
								>
									<img
                                        class="h-auto max-h-full max-w-full"
                                        src={korokImageSrc(korok.korok.type, event.id)}
                                        alt=""
									/>
								</div>

								<div class="flex min-w-0 flex-1 items-center gap-4">
									<div>
										<p
											class="text-sm font-[hylia] tracking-wider text-muted-foreground uppercase"
										>
											Korok
										</p>
										<p class="text-2xl font-[hylia] text-foreground">
											#{tripleNumber(korok.korok.number)}
										</p>
									</div>
									{#if foundIds.has(korok.korok.id)}
										<img src="/korok_seed_icon.png" alt="Found" class="h-9 w-10" />
									{/if}
								</div>

								<div class="text-right">
									<p class="text-3xl font-black text-primary">
										{korok.findCount}
									</p>
									<p class="text-sm font-semibold text-muted-foreground">
										{korok.findCount === 1 ? 'Find' : 'Finds'}
									</p>
								</div>
							</div>
						</div>
					{/each}

					{#if sortedKoroks.length === 0}
						<div class="rounded-xl border-2 border-dashed border-border p-12 text-center">
							<p class="text-lg font-bold text-foreground">No event Koroks configured</p>
						</div>
					{/if}
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Disclaimer -->
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
{/if}
