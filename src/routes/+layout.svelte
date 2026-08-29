<script lang="ts">
	import './layout.css';
	import 'leaflet/dist/leaflet.css';
	import { toggleMode, ModeWatcher } from 'mode-watcher';
	import type { PageServerData } from './$types';
	import Button from '#lib/components/ui/button/button.svelte';
	import { enhance } from '$app/forms';
	import { cn } from '$lib/utils';
	import { page } from '$app/state';
	import { MoonIcon, SunIcon } from 'lucide-svelte';
	import 'maplibre-gl/dist/maplibre-gl.css';

	let { children, data }: PageServerData = $props();
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
<svelte:head><link rel="icon" href="/korok_hunt_logo.png" /> <title>Korok Hunt</title></svelte:head>
<header class="font-[hylia] flex flex-wrap items-center border-b px-6 py-2 lg:px-16 lg:py-0">
    <div class="flex flex-1 items-center justify-between">
        <a href="/">
            <img style="min-width:48px;" class="h-12 w-12" alt="logo" src="korok_hunt_logo.png" />
        </a>
    </div>

    {#if !data.user}
        <a
            href="/login"
            class={cn(
                'block px-3 lg:px-0 py-3 lg:p-0 mr-0 underline decoration-2 underline-offset-24 lg:underline-offset-21 decoration-transparent hover:decoration-accent',
                page.url.pathname === '/login' && 'decoration-accent'
            )}
        >
            &nbsp;&nbsp;&nbsp;&nbsp;Login/Register&nbsp;&nbsp;&nbsp;&nbsp;
        </a>
    {:else}
        <span class="bg-secondary/60 mr-5 rounded border p-1 font-[hylia] text-secondary-foreground shadow-sm whitespace-nowrap">
            &nbsp;&nbsp;{data.user?.name}: {data.koroksFound ?? "???"}&nbsp;&nbsp;
        </span>
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
            <ul class="font-[hylia] items-center justify-between pt-4 text-base text-foreground lg:flex lg:pt-0">
                {@render link({ href: '/', label: 'Home' })}
                {@render link({ href: '/leaderboard', label: 'Leaderboard' })}
                {@render link({ href: '/korok-stats', label: 'Koroks' })}
                {#if data.user?.role === 'admin'}
                    {@render link({ href: '/admin', label: 'Admin' })}
                {/if}
                {#if data.user}
                    <form
                        class="flex flex-1 items-center justify-between pr-2"
                        method="post"
                        action="/login/?/signOut"
                        use:enhance
                    >
                        <Button style="margin-top: 10px; margin-bottom: 10px;" class="bg-primary" variant="outline" type="submit">Sign out</Button>
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
