<script lang="ts">
	import Map from '#lib/components/map/map.svelte';
	import * as Card from '$lib/components/ui/card/';
	import { onMount } from 'svelte';
	import { getAreas, getKoroks } from './query/korok.remote';
	import { generateQRCode } from '$lib/utils';
	import { Lightbulb, TriangleAlert, Trophy } from 'lucide-svelte';

	let areas = getAreas();
	let markers = getKoroks();

	let canvas: HTMLCanvasElement;

	onMount(() => {
		if (canvas) {
			generateQRCode({
				id: '000',
				number: 0,
				type: 0,
				canvasP: canvas
			});
		}
	});

	const faq = [
		{
			question: 'What types of places can I find Koroks?',
			answer:
				'Koroks can be found pretty much anywhere outdoors on campus within the bounds on the map above, aside from a few types of places described below.'
		},
		{
			question: 'What types of places can I NOT find Koroks?',
			answer:
				"There won't be any Koroks in restricted, public, indoor, or too dangerous areas. That includes construction areas, public roads and sidewalks, and any places you're clearly not allowed to be in. Additionally, you should not have to travel into or through any of these types of areas in order to reach a Korok."
		},
		{
			question: 'What types of objects can Koroks be placed on?',
			answer:
				'Koroks are placed on things that a sticker can actually stick to, like metal, glass, or other kinds of smooth surfaces. Stickers do not stick well to rough or dirty surfaces like bricks or bark. Koroks are also only placed on static, non-moving objects. They will not be placed on things that would reasonably be expected to move around.'
		},
		{
			question: 'Can Koroks be found on roofs, balconies, or other such places?',
			answer:
				"All Koroks can be found without stepping a foot indoors. If there isn't a way to get somewhere without going inside, then a Korok won't be there."
		},
		{
			question: 'Do I have to look underneath anything?',
			answer:
				'Traditionally, very few, if any, Koroks are placed on surfaces facing towards the ground. That means you do not have to look on the underside of every table and bench on campus, for example. In general, all Koroks should be able to be seen in some way without being crouched, but that does not mean you will not have to crouch in order to actually scan a Korok or reach certain areas.'
		},
		{
			question: 'Is the parking garage in bounds?',
			answer: "Nope! We're counting it as indoors."
		},
		{
			question: 'Can I share hints or locations of Koroks with others?',
			answer:
				'The challenge of this event is searching and finding the Koroks yourself, so giving people hints or locations hurts competition and is unfair to those searching without help. However, it is fine to share locations while actively searching with others (just remember, you are still competing with them on the leaderboard). Just do not broadcast hints or Korok locations to other people, in order to keep things fair.'
		},
		{
			question: 'Why did the Korok I scanned throw an error?',
			answer:
				" It could be an internet issue or it could be that it wasn't scanned properly. Make sure to try scanning again. If you continue to have issues, feel free to ask for help on our Discord server. Additionally, you will get an error when scanning Koroks from previous events that were not cleaned up. Make sure the sticker you're scanning has the 4th RPI Korok Hunt logo and matches in size with most of the other stickers. If you find any old Koroks, let us know on Discord."
		},
        {
            question: 'Do you have any tips on how to improve?',
            answer: "If you've made it this far down the page, you deserve some pointers on how to improve your hunting skills. As a three-time champion myself, here's my advice: Always keep your head on a swivel, examine the scenery from different perspectives, and don't give up! Try changing up your daily route through campus, and you might be surprised at how many times you've unknowingly walked past a sneaky Korok. Oh, and one more thing: don't forget to look up every once in a while!"
        }
	];
</script>

<div class="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
	<!-- Hero -->
	<section
		class="relative mb-8 overflow-hidden rounded-3xl border-2 border-border bg-card shadow-xl"
	>
		<!-- Decorative shapes -->
		<div
			class="absolute -top-16 -right-16 size-48 rounded-full bg-primary/20"
			aria-hidden="true"
		></div>
		<div
			class="absolute -bottom-24 -left-12 size-56 rounded-full bg-secondary/30"
			aria-hidden="true"
		></div>

		<div class="relative px-6 py-6 text-center sm:px-12 sm:py-6">
			<h1
				class="flex items-center justify-center text-6xl font-black tracking-tight text-foreground sm:text-7xl"
			>
				<img class="w-60 drop-shadow-lg" src="/korok_hunt_logo.png" alt="logo" />
			</h1>

			<p class="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
				Explore campus. Find hidden Koroks. Scan their QR codes. Become the greatest Korok hunter at
				RPI.
			</p>

			<div class="mt-8 flex flex-wrap justify-center gap-3">
                <a href="leaderboard">
				<div
					class="rounded-full border-2 border-primary bg-primary px-5 py-2.5 font-black text-primary-foreground shadow-sm"
				>
					<img class="inline" src="seed.png" alt="Korok seed"/> Find Koroks
				</div>
                </a>

                <a href="korok-stats">
				<div
					class="rounded-full border-2 border-border bg-secondary px-5 py-2.5 font-black text-secondary-foreground shadow-sm"
				>
					<Trophy class="inline" /> Compete for the Top 3
				</div>
                </a>
			</div>
		</div>
	</section>

	<!-- What is this -->
	<section class="mb-8">
		<Card.Root class="overflow-hidden border-2 border-border bg-card pt-0 shadow-lg">
			<Card.Header class="bg-secondary/60 px-6 py-5">
				<Card.Title class="text-3xl font-black">What Is This?</Card.Title>
			</Card.Header>

			<Card.Content class="px-6 py-6 text-base leading-7 text-foreground sm:text-lg">
				<p>
					The <strong>RPI Korok Hunt</strong> is a scavenger hunt in which you find Korok stickers hidden
					all over campus! Each Korok has a QR code to scan, which will increment your score. Compete
					against other students to find the most Koroks!
				</p>

				<p class="mt-4">
					All Koroks will be found outside and within the bounds shown on the map below. Don't go
					searching anywhere you shouldn't be; Koroks probably aren't hiding there.
				</p>

				<div class="mt-6 rounded-2xl border-2 border-primary/40 bg-primary/10 p-5">
					<p class="font-black text-primary">The Prize</p>

					<p class="mt-1">
						The <strong>top three players</strong> by November 1st will win a
						<a style="text-decoration: underline;" class="text-primary" href="/prize.png"><strong>Korok plushie</strong></a>!
					</p>
				</div>

				<p class="mt-5">
					For announcements, conversation, questions, and more, make sure to join our Discord
					server.
				</p>

				<a
					class="mt-4 inline-block font-bold text-accent underline decoration-2 underline-offset-4 hover:text-primary"
					target="_blank"
					rel="noopener noreferrer"
					href="https://discord.gg/A79Au6BcsJ"
				>
					Join the Discord →
				</a>
			</Card.Content>
		</Card.Root>
	</section>

	<!-- Map -->
	<section class="mb-8">
		<div class="mb-4 px-2">
			<p class="text-sm font-black tracking-[0.25em] text-accent uppercase">Your hunting grounds</p>

			<h2 class="mt-1 text-3xl font-black text-foreground sm:text-4xl">Where to Hunt</h2>

			<p class="mt-1 text-muted-foreground">Every Korok is somewhere inside the marked area.</p>
		</div>

		<Card.Root class="overflow-hidden border-2 border-border bg-card p-2 shadow-xl sm:p-3">
			<div class="overflow-hidden rounded-2xl">
				<Map markers={await markers} areas={await areas} />
			</div>
		</Card.Root>
	</section>

	<!-- Example -->
	<section class="mb-8">
		<Card.Root class="overflow-hidden border-2 border-border bg-card shadow-lg">
			<div class="grid md:grid-cols-2">
				<Card.Content class="flex flex-col justify-center p-6 sm:p-8">
					<p class="text-sm font-black tracking-[0.25em] text-accent uppercase">
						Know what to look for
					</p>

					<h2 class="mt-2 text-3xl font-black text-foreground">Spot the Sticker</h2>

					<p class="mt-4 leading-7 text-muted-foreground">
						Koroks are hidden throughout campus as stickers. When you find one, scan its QR code to
						add it to your score.
					</p>

					<div class="mt-5 rounded-xl border-2 border-border bg-secondary/40 p-4">
						<p class="leading-7 font-bold text-foreground">
							<Lightbulb scale={1} class="inline " />Keep your eyes open!
						</p>
						<p class="mt-1 text-sm text-muted-foreground">
							You might walk past a Korok dozens of times before finally noticing it.
						</p>
					</div>
				</Card.Content>

				<div class="m-1 rounded-xl bg-secondary/30 p-4 sm:p-6">
					<canvas
						class="h-full max-h-125 w-full rounded-2xl object-contain shadow-md"
						bind:this={canvas}
					></canvas>
				</div>
			</div>
		</Card.Root>
	</section>

	<!-- FAQ -->
	<section class="mb-8">
		<div class="mb-4 px-2">
			<p class="text-sm font-black tracking-[0.25em] text-accent uppercase">Need to know</p>

			<h2 class="mt-1 text-3xl font-black text-foreground sm:text-4xl">
				Frequently Asked Questions
			</h2>
		</div>

		<Card.Root class="border-2 border-border bg-card shadow-lg">
			<Card.Content class="p-4 sm:p-6">
				<div class="flex flex-col divide-y-2 divide-border/60">
					{#each faq as item, i (i)}
						<details class="group py-4 first:pt-0 last:pb-0">
							<summary
								class="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-bold text-foreground marker:hidden"
							>
								<span>{item.question}</span>

								<span
									class="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary transition-transform duration-200 group-open:rotate-45"
								>
									+
								</span>
							</summary>

							<p class="mt-3 max-w-4xl pr-10 leading-7 text-muted-foreground">
								{item.answer}
							</p>
						</details>
					{/each}
				</div>
			</Card.Content>
		</Card.Root>
	</section>

	<!-- Cheating notice -->
	<section>
		<Card.Root class="border-2 border-destructive/40 bg-destructive/10 shadow-md">
			<Card.Content class="flex gap-4 p-6">
				<div
					class="flex size-11 shrink-0 items-center justify-center rounded-full bg-destructive/15 text-xl"
				>
					<TriangleAlert />
				</div>

				<div>
					<h2 class="text-xl font-black text-foreground">Keep the Hunt Fair</h2>

					<p class="mt-1 leading-7 text-muted-foreground">
						Don't ruin the fun for everyone else. Removing or moving Koroks from their original
						location, as well as scanning Koroks that have been removed, will result in
						disqualification.
					</p>
				</div>
			</Card.Content>
		</Card.Root>
	</section>

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
