<script lang="ts">
	import './layout.css';
	import 'leaflet/dist/leaflet.css';
	import { toggleMode, ModeWatcher } from 'mode-watcher';
	import Button from '#lib/components/ui/button/button.svelte';
	import { enhance } from '$app/forms';
	import { cn } from '$lib/utils';
	import { page } from '$app/state';
	import { MoonIcon, SunIcon } from 'lucide-svelte';
	import 'maplibre-gl/dist/maplibre-gl.css';
	import type { LayoutProps } from './$types';
    import { dev } from '$app/environment';
    import { injectAnalytics } from '@vercel/analytics/sveltekit';

    injectAnalytics({ mode: dev ? 'development' : 'production' });

	let { children, data }: LayoutProps = $props();
</script>

{#snippet link({ label, href }: { label: string; href: string })}
	<li>
		<a
			class={cn('block border-b-2 border-transparent px-0 py-3 hover:border-accent lg:p-4', {
				'border-accent': page.url.pathname === href
			})}
			{href}>{label}</a
		>
	</li>
{/snippet}

<ModeWatcher defaultMode="light" />
<svelte:head>
    <link rel="icon" href="/korok_hunt_logo.png" />
    <title>RPI Korok Hunt</title>
    <meta name="description"
        content="The RPI Korok Hunt is a campus-wide scavenger hunt! Scan hidden QR codes to collect Koroks and increment your score!" />
    <meta charset="UTF-8">
    <!-- Open Graph / Discord -->
    <meta property="og:title" content="The RPI Korok Hunt" />
    <meta property="og:description" content="Find Koroks hidden across campus in the RPI Korok Hunt!" />
    <meta property="og:image" content="https://www.rpikorokhunt.com/korok_hunt_logo.png" />
</svelte:head>
<header class="flex flex-wrap items-center border-b px-6 py-2 font-[hylia] lg:px-16 lg:py-0">
	<div class="flex flex-1 items-center justify-between">
		<a href="/">
			<img style="min-width:48px;" class="h-12 w-12 drop-shadow-lg" alt="logo" src="korok_hunt_logo.png" />
		</a>
	</div>

	{#if !data.user}
		<a
			href="/login"
			class={cn(
				'mr-0 block px-3 py-3 underline decoration-transparent decoration-2 underline-offset-24 hover:decoration-accent lg:p-0 lg:px-0 lg:underline-offset-21',
				page.url.pathname === '/login' && 'decoration-accent'
			)}
		>
			Login/Register
		</a>
	{:else}
        {#if data.user.name === "RyGuy" || data.user.name === "Sogga" || data.user.name === "LVGHunting"}
		    <span
			    class="inline mr-5 rounded border bg-secondary/60 p-1 px-3 font-[hylia] whitespace-nowrap text-secondary-foreground shadow-sm"
    		>
	    		{data.user?.name}:
                <img class="inline h-5" alt="Korok seed" src="seed.png">
		    </span>
        {:else}
		    <span
			    class="mr-5 rounded border bg-secondary/60 p-1 px-3 font-[hylia] whitespace-nowrap text-secondary-foreground shadow-sm"
    		>
	    		{data.user?.name}: {data.koroksFound ?? '???'}
		    </span>
        {/if}
	{/if}

	<label for="menu-toggle" class="pointer-cursor block lg:hidden">
		<svg
			class="fill-current text-foreground"
			xmlns="http://www.w3.org/2000/svg"
			width="20"
			height="20"
			viewBox="0 0 20 20"
			><title>menu</title><path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z"></path>
		</svg>
	</label>
	<input class="hidden" type="checkbox" id="menu-toggle" />

	<div class="hidden w-full lg:flex lg:w-auto lg:items-center" id="menu">
		<nav>
			<ul
				class="items-center justify-between pt-4 font-[hylia] text-base text-foreground lg:flex lg:pt-0"
			>
				{@render link({ href: '/', label: 'Home' })}
				{@render link({ href: '/leaderboard', label: 'Leaderboard' })}
				{@render link({ href: '/korok-stats', label: 'Koroks' })}
				{#if data.user?.role === 'admin'}
					{@render link({ href: '/admin', label: 'Admin' })}
				{/if}
				{#if data.user?.role === 'muncher' || data.user?.role === 'admin'}
					{@render link({ href: '/munch', label: 'Munch' })}
				{/if}
				{#if data.user}
					<form
						class="flex flex-1 items-center justify-between py-2 pr-2"
						method="post"
						action="/login/?/signOut"
						use:enhance
					>
						<Button class="bg-card" variant="outline" type="submit">Sign out</Button>
					</form>
				{/if}
				<Button class="bg-card" onclick={toggleMode} variant="outline" size="icon">
					<SunIcon
						class="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all! dark:scale-0 dark:-rotate-90"
					/>
					<MoonIcon
						class="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all! dark:scale-100 dark:rotate-0"
					/>
					<span class="sr-only">Toggle theme</span>
				</Button>
			</ul>
		</nav>
	</div>
</header>
{@render children()}

<style>
	#menu-toggle:checked + #menu {
		display: block;
	}
</style>
