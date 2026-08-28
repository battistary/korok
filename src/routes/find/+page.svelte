<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { onMount } from 'svelte';
	import { logFind } from '../query/korok.remote';
	import type { PageData } from './$types';
	import { CircleUserRound } from 'lucide-svelte';
	import { tripleNumber } from '$lib/utils';
	import Spinner from '#lib/components/ui/spinner/spinner.svelte';

	let { data }: { data: PageData } = $props();
	let failed = $state(false);
	let found = $state(false);
	let yourFinds = $state(0);
	let korokFinds = $state(0);
	let loaded = $state(false);
	let korok: {
		number: number;
		id: string;
		type: number;
		description: string;
		lat: number;
		lng: number;
		release: number;
		isRelease: boolean;
	} | null = $state(null);
	onMount(async () => {
		if (!data.user || !data.id) return;
		let e = await logFind({ korokId: data.id, userId: data.user.id, time: new Date() });
		if (e) {
			korok = e.korok;
			found = e.found;
			yourFinds = e.userFinds ?? 0;
			korokFinds = e.korokFinds ?? 0;
		} else {
			failed = true;
		}
		loaded = true;
	});
</script>

{#if loaded}
	<div class="mx-auto max-w-4xl px-4 py-8">
		<div class="mb-8 text-center">
			<h1 class="text-5xl font-black tracking-tight text-foreground">Korok Tracker</h1>

			<p class="mt-2 text-lg text-muted-foreground">Scan more Koroks to track your progress</p>
		</div>

		<Card.Root class="overflow-hidden border-2 border-border bg-card pt-0 shadow-lg">
			<Card.Header class="border-b-2 border-border bg-secondary/60 px-6 py-5">
				<div class="flex items-center justify-between">
					<div>
						<Card.Title class="text-2xl font-black">
							{#if !data.user}
								You need to be logged in to find a korok
							{:else if failed}
								Failed to find korok
							{:else if found}
								You already found this korok
							{:else}
								You found a new korok
							{/if}
						</Card.Title>

						<Card.Description class="mt-1">
							{#if !data.user}
								Go to the login page in order to find Korok then scan again.
							{:else if failed}
								This korok does not exist check if it belongs to this year and try again
							{:else}
								You have found {yourFinds} korok{yourFinds !== 1 ? 's' : ''}<br />
								This korok has been found {korokFinds} time{korokFinds !== 1 ? 's' : ''}
							{/if}
						</Card.Description>
					</div>

					<div class="rounded-full border-2 border-border bg-background px-4 py-2 font-bold">
						#{korok?.number ? tripleNumber(korok?.number) : '???'}
					</div>
				</div>
			</Card.Header>

			<Card.Content class="p-4 sm:p-6">
				<div class="flex flex-col items-center gap-3">
					{#if !data.user}
						<CircleUserRound size="20rem" strokeWidth={1} />
					{:else if failed}
						<div>
							<img class="h-80" src="/unknown.svg" alt="unknown" />
						</div>
					{:else}
						<div>
							<img
								class="h-80"
								src={`/koroks/k_${korok?.number}.png`}
								alt={korok?.number.toString()}
							/>
						</div>
					{/if}
				</div>
			</Card.Content>
		</Card.Root>
	</div>
{:else}
	<div class="flex flex-col items-center justify-center">
		<h1 class="text-6xl">Loading:</h1>
		<Spinner class="size-60" scale="10" />
	</div>
{/if}
<!-- <div class="m-8">
	{#if !data.user}
		<Card.Root>
			<Card.Header>
				<Card.Title class="flex flex-col items-center text-3xl">
					<CircleUserRound size="20rem" strokeWidth={1} />
					<p>You need to login or register to find a korok. Go to the login/register page.</p>
				</Card.Title>
			</Card.Header>
		</Card.Root>
	{:else if failed}
		<Card.Root>
			<Card.Header>
				<Card.Title class="flex flex-col items-center text-3xl">
					<img class="h-80" src="/unknown.svg" alt="unknown" />
					<p>Failed to find korok. Please try again.</p>
				</Card.Title>
				<Card.Action class="text-3xl">#??</Card.Action>
			</Card.Header>
		</Card.Root>
	{/if}

	{#if korok}
		<Card.Root>
			<Card.Header>
				<Card.Title class="flex flex-col items-center text-3xl">
					<img src="/koroks/k_{korok.number}.png" alt="Korok {korok.number}" />
					<p>{found ? 'You have already found me' : 'You found a new Korok'}</p>
					<p>You have found {yourFinds} Korok{yourFinds === 1 ? '' : 's'}</p>
					<p>
						{korokFinds - 1} other {korokFinds - 1 === 1 ? 'person has' : 'people have'} found this Korok
					</p>
				</Card.Title>
				<Card.Action class="text-3xl">#{korok.number}</Card.Action>
			</Card.Header>
		</Card.Root>
	{/if}
</div> -->
