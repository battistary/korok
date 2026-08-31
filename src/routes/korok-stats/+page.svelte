<script>
	import { tripleNumber } from '$lib/utils';
	import * as Card from '$lib/components/ui/card/';
	import { getKorokFinds } from '../query/korok.remote';
	import Toggle from '#lib/components/ui/toggle/toggle.svelte';
	import { ArrowDown01, ArrowUp01 } from 'lucide-svelte';

	let koroks = await getKorokFinds();
	let sortMode = $state('Number');
	let sortDir = $state('asc');
	let sortedKoroks = $derived(
		[...koroks].sort((a, b) => {
			let el1 = sortDir === 'asc' ? a : b;
			let el2 = sortDir === 'asc' ? b : a;
			if (sortMode === 'Number') {
				return el1.korok.number - el2.korok.number;
			}
			if (sortMode === 'Finds') {
				return el2.findCount - el1.findCount;
			}
			return 0;
		})
	);
</script>

<div class="mx-auto max-w-4xl px-4 py-8">
	<!-- Header -->
	<div class="mb-8 text-center">
		<h1 class="text-5xl font-black tracking-tight text-foreground">Korok Statistics</h1>

		<p class="mt-2 text-lg text-muted-foreground">The most discovered Koroks</p>
	</div>

	<!-- Leaderboard -->
	<Card.Root class="overflow-hidden border-2 border-border bg-card pt-0 shadow-lg">
		<Card.Header class="-m-[1px] border-b-2 border-border bg-secondary/60 px-6 py-5">
			<div class="flex items-center justify-between">
				<div>
                    <img class="inline" src="seed.png" alt="Korok seed"/><Card.Title class="inline text-2xl font-black px-2">Korok Rankings</Card.Title>
					<Card.Description class="mt-1">Ranked by {sortMode === 'Number' ? 'Korok number' : 'number of finds'}</Card.Description>
				</div>
				<div class="flex flex-col items-end gap-2">
					<div class="rounded-full border-2 border-border bg-background px-4 py-2 font-bold">
                        {sortedKoroks.length} Korok{sortedKoroks.length !== 1 ? 's' : ''}
					</div>
					<div class="flex gap-2">
						<Toggle
							class="hover:bg-primary-100 w-20 bg-primary font-bold text-primary-foreground aria-pressed:bg-primary"
							variant="outline"
							onPressedChange={(e) => (sortMode = e ? 'Finds' : 'Number')}>{sortMode}</Toggle
						>
						<Toggle
							class="hover:bg-primary-100 w-8 bg-primary font-bold text-primary-foreground aria-pressed:bg-primary"
							variant="outline"
							onPressedChange={(e) => (sortDir = e ? 'desc' : 'asc')}
						>
							{#if sortDir === 'desc'}<ArrowUp01 />{:else}<ArrowDown01 />{/if}
						</Toggle>
					</div>
				</div>
			</div>
		</Card.Header>

		<Card.Content class="p-4 sm:p-6">
			<div class="flex flex-col gap-3">
				{#each sortedKoroks as korok, index (korok.korok.id)}
					{@const rank = index + 1}

					<div
						class="group relative overflow-hidden rounded-xl border-2 border-border/70 bg-secondary/60 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary hover:shadow-md"
					>
						<div class="relative flex items-center gap-4">
							<!-- Rank -->
							<div
								class={`flex size-12 shrink-0 items-center justify-center rounded-full border-2 p-1 font-black ${
                                    sortMode === 'Number'
                                        ? 'border-border bg-card text-muted-foreground'
                                        : rank === 1
										    ? 'border-yellow-600 bg-yellow-400/30 text-yellow-800'
    										: rank === 2
	    										? 'border-slate-400 bg-slate-300/40 text-slate-700'
		    									: rank === 3
			    									? 'border-orange-700 bg-orange-400/30 text-orange-800'
				    								: 'border-border bg-card text-muted-foreground'
								}`}
							>
								<img
									class="h-auto max-h-full max-w-full"
									src={`/koroks/k_${korok.korok.type}.png`}
									alt=""
								/>
							</div>

							<!-- Korok number -->
							<div class="min-w-0 flex-1">
								<p class="text-sm font-[hylia] tracking-wider text-muted-foreground uppercase">
									Korok
								</p>

								<p class="text-2xl font-[hylia] text-foreground">
									#{tripleNumber(korok.korok.number)}
								</p>
							</div>

							<!-- Finds -->
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
			</div>
		</Card.Content>
	</Card.Root>
    <!-- Disclaimer -->
    <section>
        <br>
        <p style="text-align: center" class="mt-1">
            Made by RPI students, for RPI students.<br>
            Not endorsed or sponsored by Rensselaer Polytechnic Institute.<br>
            The code for this website can be found <a style="text-decoration: underline;" class="text-primary" href="https://github.com/battistary/korok">here</a>.
        </p> 
    </section>
</div>
