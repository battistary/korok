<script lang="ts">
	import * as Card from '$lib/components/ui/card/';
	import { ArrowDown01, ArrowUp01, SearchIcon, Trophy, Infinity } from 'lucide-svelte';
	import {
		getLeaderBoardFinds,
		getMyLeaderboard,
		getUserFinds,
		joinLeaderBoard,
		leaveLeaderBoard,
		makeLeaderBoard
	} from '../query/korok.remote';
	import { Toggle } from '$lib/components/ui/toggle/';
	import * as InputGroup from '$lib/components/ui/input-group/';
	import * as Select from '$lib/components/ui/select/';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import Label from '#lib/components/ui/label/label.svelte';
	import type { PageProps } from './$types';
	import * as Dialog from '$lib/components/ui/dialog/';
	import * as InputOTP from '$lib/components/ui/input-otp/';
	import { cn } from '$lib/utils';
	import { REGEXP_ONLY_CHARS } from 'bits-ui';

	let { data }: PageProps = $props();
	let leaderboard = $state(-1);

	let myLeaderboardsPromise = $derived(getMyLeaderboard());

	let myLeaderboards = $derived([
		{ id: -1, name: 'Global', code: '', description: '' },
		...(myLeaderboardsPromise.current ?? [])
	]);

	let players = $derived(
		leaderboard === -1 ? getUserFinds() : getLeaderBoardFinds({ leaderBoardId: leaderboard })
	);
	let sortDir = $state('desc');
	let filterValue = $state('');
    let sortedPlayers = $derived.by(() => {
        const all = players.current ?? [];
        const specialNames = ['RyGuy', 'Sogga', 'LVGHunting'];
        const special = all.filter(p => specialNames.includes(p.user.name));
        const regular = all.filter(p => !specialNames.includes(p.user.name));

        const sortedRegular = [...regular].sort((a, b) => {
            const el1 = sortDir === 'asc' ? a : b;
            const el2 = sortDir === 'asc' ? b : a;
            return el1.koroksFound - el2.koroksFound;
        });

        const filteredRegular = sortedRegular.filter(p =>
            p.user.name.toLowerCase().includes(filterValue.toLowerCase())
        );
        const filteredSpecial = special.filter(p =>
            p.user.name.toLowerCase().includes(filterValue.toLowerCase())
        );

        const orderedSpecial = specialNames
        .map(name => filteredSpecial.find(p => p.user.name === name))
        .filter(Boolean);

        return [...filteredRegular, ...orderedSpecial];
    });

	let leaderboardCode = $state('');
	let newLeaderboardName = $state('');
	let newLeaderboardDescription = $state('');
	let joinLeaderboard = $state(false);
	let createLeaderboard = $state(false);

    let name = $derived(myLeaderboards.find((l) => l.id === leaderboard)?.name);
</script>

<div class="mx-auto max-w-4xl px-4 py-8">
	<!-- Header -->
	<div class="mb-8">
		<div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
			<div>
				<h1 class="text-5xl font-black tracking-tight text-foreground">Hunter Leaderboard</h1>

				<p class="mt-2 text-lg text-muted-foreground">The greatest Korok hunters.</p>
			</div>

			<div
				class="flex flex-col items-center gap-2 rounded-xl border-2 border-border bg-card px-4 py-3 shadow-sm"
			>
				<div class="flex items-center gap-2">
					<span class="text-sm font-bold tracking-wider text-muted-foreground uppercase">
						Leaderboard:
					</span>
					<Select.Root
						type="single"
						bind:value={() => leaderboard.toString(), (e) => (leaderboard = Number(e))}
					>
						<Select.Trigger class="w-28 border-2 bg-background font-black truncate">
							{#if leaderboard === -1}
								Global
							{:else}
                                {name.length > 11 ? name.substring(0, 8) + "..." : name}
							{/if}
						</Select.Trigger>

						<Select.Content class="overflow-hidden truncate">
							{#each myLeaderboards as leaderboard, index (index)}
								<Select.Item value={leaderboard.id.toString()} class="truncate overflow-hidden">
									{leaderboard.name}
								</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>
				{#if data.user}
					<div class="flex items-center gap-2">
						<Button onclick={() => (joinLeaderboard = true)}>Join Leaderboard</Button>
						<Button variant="secondary" onclick={() => (createLeaderboard = true)}
							>Create Leaderboard</Button
						>
					</div>
				{/if}
				{#if leaderboard !== -1}
					<Button
						variant="destructive"
						onclick={async () => {
							if (!confirm('Are you sure you want to leave this leaderboard?')) return;
							await leaveLeaderBoard({ leaderBoardId: leaderboard });
							await myLeaderboardsPromise.refresh();
							leaderboard = -1;
						}}>Leave Leaderboard</Button
					>
				{/if}
			</div>
		</div>
	</div>
	<!-- Leaderboard -->
	<Card.Root class="overflow-hidden border-2 border-border bg-card pt-0 shadow-lg">
		<Card.Header class="-m-[1px] border-b-2 border-border bg-secondary/60 px-6 py-5">
			<div class="flex items-center justify-between">
				<div>
					<Card.Title class="text-2xl font-black">
						<!-- <Trophy class="inline" /> -->
                        <img alt="Hestu" src="/hestu.png" class="w-15 inline" />
						{leaderboard === -1
							? 'Hunter Rankings'
							: myLeaderboards.find((l) => l.id === leaderboard)?.name}
						{#if leaderboard !== -1}
							<p class="text-xl">
								Join: #{myLeaderboards.find((l) => l.id === leaderboard)?.code}
							</p>
						{/if}
					</Card.Title>

					<Card.Description class="mt-1">
						{leaderboard === -1
							? 'Ranked by Koroks found'
							: myLeaderboards.find((l) => l.id === leaderboard)?.description}
						<br />
					</Card.Description>
				</div>

				<div class="flex flex-col items-end gap-2">
					<div class="grow rounded-full border-2 border-border bg-background px-4 py-2 font-bold">
						{sortedPlayers.length - 3} Hunter{sortedPlayers.length !== 1 ? 's' : ''}
					</div>
					<div class="flex w-30 flex-wrap justify-end gap-2 lg:w-50">
						<InputGroup.Root class="bg-background ">
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
						class={`group relative overflow-hidden rounded-xl border-2 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${'bg-secondary/60'}`}
					>
						<div class="flex items-center gap-4">
							<!-- Rank -->
							<div
								class={`font-[hylia] flex size-12 p-1 shrink-0 items-center justify-center rounded-full border-2 text-xl font-black ${
									rank === 1
										? 'border-yellow-600 bg-yellow-400/30 text-yellow-800'
										: rank === 2
											? 'border-slate-400 bg-slate-300/40 text-slate-700'
											: rank === 3
												? 'border-orange-700 bg-orange-400/30 text-orange-800'
												: 'border-border bg-card text-muted-foreground'
								}`}
							>
                                {#if player.user.name === "RyGuy"}
                                    <img
                                        class="h-auto max-h-full max-w-full"
                                        src="hestu.png"
                                        alt="Hestu"
                                    />
                                {:else if player.user.name === "LVGHunting"}
                                    <img
                                        class="h-auto max-h-full max-w-full"
                                        src="kohga.png"
                                        alt="Kohga"
                                    />
                                {:else if player.user.name === "Sogga"}
                                    <img
                                        class="h-auto max-h-full max-w-full"
                                        src="link.png"
                                        alt="Link"
                                    />
                                {:else}
                                    #{rank}
                                {/if}
							</div>

							<!-- Player -->
							<div class="min-w-0 flex-1">
								<p class="truncate font-[hylia] text-xl text-foreground">
									{player.user.name}
								</p>

                                {#if player.user.name === "RyGuy"}
									<p class="mt-0.5 text-sm text-muted-foreground">
                                        <Infinity class="inline" /> Koroks
									</p>
                                {:else if player.user.name === "LVGHunting"}
									<p class="mt-0.5 text-sm text-muted-foreground">
                                        -1 Koroks
									</p>
                                {:else if player.user.name === "Sogga"}
									<p class="mt-0.5 text-sm text-muted-foreground">
                                        is a Korok
									</p>
								{:else if player.lastFoundAt}
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
                                {#if player.user.name === "RyGuy"}
                                    <p class="text-xl font-semibold text-muted-foreground">
                                        Hestu
                                    </p>
                                {:else if player.user.name === "LVGHunting"}
                                    <p class="text-xl font-semibold text-muted-foreground">
                                        Hestu's Assistant
                                    </p>
                                {:else if player.user.name === "Sogga"}
                                    <p class="text-xl font-semibold text-muted-foreground">
                                        Hestu's Assistant
                                    </p>
                                {:else}
                                    <p class="text-xl font-black text-primary">
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
			</div>
		</Card.Content>
	</Card.Root>
    <!-- Disclaimer -->
    <section>
        <br>
        <p style="font-size: 14pt; text-align: center" class="mt-1">
            Made by RPI students, for RPI students.<br>
            Not endorsed or sponsored by Rensselaer Polytechnic Institute.<br>
            The code for this website can be found <a style="text-decoration: underline;" class="text-primary" href="https://github.com/battistary/korok">here</a>.
        </p> 
    </section>
</div>

<Dialog.Root bind:open={joinLeaderboard}>
	<Dialog.Content>
		<Dialog.Title class="text-2xl font-black">Join Leaderboard</Dialog.Title>
		<Dialog.Description class="flex flex-col gap-2">
			<Label>Code:</Label>
			<InputOTP.Root inputmode="text" bind:value={leaderboardCode} maxlength={6}>
				{#snippet children({ cells })}
					<span class="text-2xl">#</span>
					<InputOTP.Group pattern={REGEXP_ONLY_CHARS}>
						{#each cells.slice(0, 6) as cell (cell)}
							<InputOTP.Slot {cell} />
						{/each}
					</InputOTP.Group>
				{/snippet}
			</InputOTP.Root>
		</Dialog.Description>
		<Dialog.Footer>
			<Dialog.Close
				class={cn('font-black', buttonVariants({ variant: 'default' }))}
				onclick={async () => {
					let result = await joinLeaderBoard({ code: leaderboardCode });
					if (result) {
						myLeaderboardsPromise.refresh();
					}
				}}>Join leaderboard</Dialog.Close
			>
			<Dialog.Close class={buttonVariants({ variant: 'default' })}>Cancel</Dialog.Close>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={createLeaderboard}>
	<Dialog.Content>
		<Dialog.Title class="text-2xl font-black">Create Leaderboard</Dialog.Title>
		<Dialog.Description class="flex flex-col gap-2">
			<Label>Name:</Label>
			<InputGroup.Root>
				<InputGroup.Input bind:value={newLeaderboardName} type="text" placeholder="Name" />
			</InputGroup.Root>
			<Label>Description:</Label>
			<InputGroup.Root>
				<InputGroup.Input
					bind:value={newLeaderboardDescription}
					type="textarea"
					placeholder="Description"
				/>
			</InputGroup.Root>
		</Dialog.Description>
		<Dialog.Footer>
			<Dialog.Close
				class={buttonVariants({ variant: 'default' })}
				onclick={async () => {
					let result = await makeLeaderBoard({
						name: newLeaderboardName,
						description: newLeaderboardDescription
					});
					if (result) {
						myLeaderboardsPromise.refresh();
					}
				}}>Create</Dialog.Close
			>
			<Dialog.Close class={buttonVariants({ variant: 'default' })}>Cancel</Dialog.Close>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
