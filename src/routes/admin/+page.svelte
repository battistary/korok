<script lang="ts">
	import Map from '#lib/components/map/map.svelte';
	import * as Dialog from '$lib/components/ui/dialog/';
	import Label from '#lib/components/ui/label/label.svelte';
	import Input from '#lib/components/ui/input/input.svelte';
	import Spinner from '#lib/components/ui/spinner/spinner.svelte';
	import Button, { buttonVariants } from '#lib/components/ui/button/button.svelte';
	import {
		addAreaAdmin,
        addEvent,
		addKoroksAdmin,
		deleteAllLeaderBoard,
		deleteAreaAdmin,
        deleteEvent,
		deleteKoroksAdmin,
		deleteReleaseKoroks,
		deleteUser,
		getAdminData,
		getAreas,
        getEvents,
		getKoroksAdmin,
		getUserFinds,
		releaseFindableAdmin,
		releaseKoroks,
		releaseUnFindableAdmin,
		toggleAdmin,
		toggleMuncher,
		unreleaseKoroks,
        updateEvent,
		updateFindableAdmin,
		updateKoroksAdmin,
		resetUserKoroks,
		editPlayer
	} from '../query/korok.remote';
	import { Toggle } from '$lib/components/ui/toggle/index.js';
	import * as Card from '$lib/components/ui/card';
	import Switch from '#lib/components/ui/switch/switch.svelte';
	import { cn, generateQRCode, tripleNumber } from '$lib/utils';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as InputGroup from '$lib/components/ui/input-group/';
	import * as ContextMenu from '$lib/components/ui/context-menu/index.js';
	import { invalidate } from '$app/navigation';
	import {
		ArrowDown01,
		ArrowUp01,
        Crown,
        Download,
		Hamburger,
		SearchIcon,
		UserLock,
		Leaf
	} from 'lucide-svelte';
	import { iconImages, korokImages } from '$lib/generated/images';

	let adminDataPromise = getAdminData();
	let adminData = $derived(adminDataPromise.current ?? []);

	let areasPromise = getAreas();
	let areas = $derived(areasPromise.current ?? []);

	let markers = getKoroksAdmin();

    let eventsPromise = getEvents();
    let events = $derived(eventsPromise.current ?? []);
    let openEvent = $state(false);
    let changeEventId = $state<number | null>(null);
    let eventEdit = $state<{
        name: string;
        description: string;
        isActive: boolean;
        isVisible: boolean;
        backgroundImage: string | null;
    }>({
        name: '',
        description: '',
        isActive: true,
        isVisible: false,
        backgroundImage: null
    });

	let currentRelease = $state(-1);

	let openPlayer = $state(false);
	let playerEdit = $state({
		id: '',
		name: '',
		subrole: '',
		subtext: '',
		icon: '',
		adminOrder: 0
	});

	let playersPromise = getUserFinds();
	let sortDir = $state('desc');
	let filterValue = $state('');
	let sortedPlayers = $derived.by(() => {
		let all = playersPromise.current ?? [];

		all.sort((a, b) => {
			const el1 = sortDir === 'asc' ? a : b;
			const el2 = sortDir === 'asc' ? b : a;
			return (
				(el1.user.role === 'admin'
					? el2.user.role === 'admin'
						? el2.user.adminOrder - el1.user.adminOrder
						: -1
					: 1) ||
				el1.koroksFound - el2.koroksFound ||
				(el1.lastFoundAt?.getMilliseconds() ?? 0) - (el2.lastFoundAt?.getMilliseconds() ?? 0)
			);
		});

		all = all.filter((p) => p.user.name.toLowerCase().includes(filterValue.toLowerCase()));

		return all;
	});

    let hunterCount = $derived(
        sortedPlayers.filter((p) => p.user.role !== 'admin').length
    );

	$effect(() => {
		if (currentRelease === -1) {
			currentRelease = adminData[0]?.release ?? -1;
		}
	});

	let markersFiltered = $derived(
		markers.current
			?.filter((m) => m?.release === currentRelease)
			.sort((a, b) => a.number - b.number) ?? []
	);

	let nextType = $derived(((markersFiltered.at(-1)?.type ?? -1) + 1) % 13);

	let openKorok = $state(false);

	let nextNumber = $derived((markersFiltered.at(-1)?.number ?? 0) + 1);

	let changeId = $state('');

	let newKorok: {
		lat: number;
		lng: number;
		number: number;
		description: string;
		title?: string;
		type: number;
		release: number;
		isRelease: boolean;
        eventId: number | null;
	} = $state({
		description: '',
		lat: 0,
		lng: 0,
		number: 0,
		title: '',
		release: 0,
		type: 0,
		isRelease: false,
        eventId: null
	});

	let adding = $state(false);

    const formatLastFind = (d: Date) =>
        `${d.toLocaleDateString([], { month: 'numeric', day: 'numeric' })} at ${d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
</script>

<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
	<!-- Header -->
	<div class="mb-8">
		<div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
			<div>
				<h1 class="text-5xl font-black tracking-tight text-foreground">Korok Hunt Admin</h1>

				<p class="mt-2 text-lg text-muted-foreground">
					Manage releases, locations, and Korok visibility.
				</p>
			</div>

			<div
				class="flex items-center gap-2 rounded-xl border-2 border-border bg-card px-4 py-3 shadow-sm"
			>
				<span class="text-sm font-bold tracking-wider text-muted-foreground uppercase">
					Release:
				</span>

				<Select.Root
					type="single"
					bind:value={() => currentRelease.toString(), (e) => (currentRelease = Number(e))}
				>
					<Select.Trigger class="w-28 truncate border-2 bg-background font-black">
						{#if currentRelease === -1}
							No Releases
						{:else}
							{currentRelease}
						{/if}
					</Select.Trigger>

					<Select.Content class="w-28 truncate">
						{#each adminData as release, index (index)}
							<Select.Item value={release.release + ''} class="truncate">
								Release {release.release}
							</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>
		</div>
	</div>

	<!-- Release controls -->
	<section class="mb-8">
		<Card.Root class="overflow-hidden border-2 border-border bg-card pt-0 shadow-lg">
			<Card.Header class="-m-[1px] border-b-2 border-border bg-secondary/60 px-6 py-5">
				<Card.Title class="text-2xl font-black">Release Management</Card.Title>

				<Card.Description>
					Actions apply to Release #{currentRelease}.
				</Card.Description>
			</Card.Header>

			<Card.Content class="grid gap-4 p-6 md:grid-cols-3">
				<!-- Release -->
				<div class="rounded-xl border-2 border-primary/30 bg-primary/10 p-5">
					<div class="mb-4">
						<p class="font-black text-foreground">Release Koroks</p>
						<p class="mt-1 text-sm leading-5 text-muted-foreground">
							Make all Koroks in this release visible to players.
						</p>
					</div>

					<Button
						class="w-full"
						onclick={() => {
							if (confirm('Are you sure you want to release all koroks for this release?')) {
								releaseKoroks({ release: currentRelease });
								markers.refresh();
							}
						}}
					>
						Release All
					</Button>
					<Button
						class="w-full"
						onclick={() => {
							if (confirm('Are you sure you want to unrelease all koroks for this release?')) {
								unreleaseKoroks({ release: currentRelease });
								markers.refresh();
							}
						}}
					>
						Unrelease All
					</Button>
				</div>

				<!-- Unfindable -->
				<div class="rounded-xl border-2 border-secondary/50 bg-secondary/20 p-5">
					<div class="mb-4">
						<p class="font-black text-foreground">Hide Release</p>
						<p class="mt-1 text-sm leading-5 text-muted-foreground">
							Remove this release from the map and player statistics.
						</p>
					</div>

					<Button
						variant="secondary"
						class="w-full"
						onclick={async () => {
							if (
								confirm('Are you sure you want to make all koroks unfindable for this release?')
							) {
								await releaseUnFindableAdmin({ release: currentRelease });
								markers.refresh();
							}
						}}
					>
						Make Unfindable
					</Button>
					<Button
						variant="secondary"
						class="w-full"
						onclick={async () => {
							if (confirm('Are you sure you want to make all koroks findable for this release?')) {
								await releaseFindableAdmin({ release: currentRelease });
								markers.refresh();
							}
						}}
					>
						Make Findable
					</Button>
				</div>

				<!-- Delete -->
				<div class="rounded-xl border-2 border-destructive/40 bg-destructive/10 p-5">
					<div class="mb-4">
						<p class="font-black text-foreground">Delete Release</p>
						<p class="mt-1 text-sm leading-5 text-muted-foreground">
							Permanently delete every Korok in this release.
						</p>
					</div>

					<Button
						variant="destructive"
						class="w-full"
						onclick={async () => {
							if (confirm('Are you sure you want to delete all koroks for this release?')) {
								await deleteReleaseKoroks({ release: currentRelease });
								markers.refresh();
							}
						}}
					>
						Delete All
					</Button>
				</div>
			</Card.Content>
		</Card.Root>
	</section>

    <!-- Event Management -->
    <section class="mb-8">
        <Card.Root class="overflow-hidden border-2 border-border bg-card pt-0 shadow-lg">
            <Card.Header class="-m-[1px] border-b-2 border-border bg-secondary/60 px-6 py-5">
                <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <Card.Title class="text-2xl font-black">Event Management</Card.Title>
                        <Card.Description>
                            {events.length} event{events.length !== 1 ? 's' : ''}
                        </Card.Description>
                    </div>
                    <Button
                        onclick={() => {
                            changeEventId = null;
                            eventEdit = { name: '', description: '', isActive: true, isVisible: false, backgroundImage: null };
                            openEvent = true;
                        }}
                    >
                        Create Event
                    </Button>
                </div>
            </Card.Header>

            <Card.Content class="p-4 sm:p-6">
                <div class="flex flex-col gap-3">
                    {#each events as event (event.id)}
                        <div
                            class="rounded-xl border-2 border-border/70 bg-secondary/60 p-4 transition-all hover:border-primary hover:shadow-md"
                        >
                            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div class="min-w-0 flex-1">
                                    <p class="font-[hylia] text-xl text-foreground">{event.name}</p>
                                    <p class="mt-0.5 text-sm text-muted-foreground">{event.description}</p>
                                </div>
                                <div class="flex items-center gap-2">
                                    <span
                                        class={`rounded-full border-2 px-3 py-1 text-xs font-black ${
event.isActive
? 'border-primary/40 bg-primary/15 text-primary'
: 'border-border bg-card text-muted-foreground'
}`}
                                    >
                                        {event.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                    {#if !event.isVisible}
                                        <span
                                            class="rounded-full border-2 border-destructive/40 bg-destructive/15 px-3 py-1 text-xs font-black text-destructive"
                                        >
                                            Hidden
                                        </span>
                                    {/if}
                                    <Button
                                        variant="outline"
                                        onclick={() => {
                                            changeEventId = event.id;
                                            eventEdit = {
                                                name: event.name,
                                                description: event.description,
                                                isActive: event.isActive,
                                                isVisible: event.isVisible,
                                                backgroundImage: event.backgroundImage ?? null
                                            };
                                            openEvent = true;
                                        }}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onclick={async () => {
                                            if (!confirm('Are you sure you want to delete this event?')) return;
                                            const result = await deleteEvent({ id: event.id });
                                            if (typeof result === 'string') {
                                                alert(result);
                                                return;
                                            }
                                            await eventsPromise.refresh();
                                        }}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        </div>
                    {/each}

                    {#if events.length === 0}
                        <div class="rounded-xl border-2 border-dashed border-border p-12 text-center">
                            <p class="text-lg font-bold text-foreground">No events yet</p>
                            <p class="mt-1 text-sm text-muted-foreground">
                                Create one to start organizing event Koroks.
                            </p>
                        </div>
                    {/if}
                </div>
            </Card.Content>
        </Card.Root>
    </section>

	<!-- Map -->
	<section class="mb-8">
		<div class="mb-4 px-2">
			<p class="text-sm font-black tracking-[0.25em] text-accent uppercase">Map Editor</p>

			<h2 class="mt-1 text-3xl font-black text-foreground">Hunting Grounds</h2>

			<p class="mt-1 text-muted-foreground">
				Add and remove areas and Korok locations directly on the map.
			</p>
		</div>

		<Card.Root class="overflow-hidden border-2 border-border bg-card p-2 shadow-xl sm:p-3">
			<div class="overflow-hidden rounded-2xl">
				<Map
					markers={markersFiltered}
					{areas}
					onNewArea={async (area) => {
						await addAreaAdmin({
							color: area.color,
							points: area.points
						});
						await areasPromise.refresh();
					}}
					onDeleteArea={async (id) => {
						if (!confirm('Are you sure you want to delete this Area?')) return;
						await deleteAreaAdmin({ id });
						await areasPromise.refresh();
					}}
					onDeleteKorok={async (id) => {
						if (!confirm('Are you sure you want to delete this Korok?')) return;
						await deleteKoroksAdmin({ id });
						await markers.refresh();
					}}
					onNewKorok={(area) => {
						openKorok = true;

						newKorok = {
							description: '',
							lat: area[0],
							lng: area[1],
							number: nextNumber,
							release: currentRelease === -1 ? 0 : currentRelease,
							type: nextType,
							isRelease: false,
                            eventId: null
						};
					}}
					actions={{ newAreas: true, newKoroks: true, deleteAreas: true, deleteKoroks: true }}
				/>
			</div>
		</Card.Root>
	</section>

	<!-- Korok list -->
	<section>
		<Card.Root class="overflow-hidden border-2 border-border bg-card pt-0 shadow-lg">
			<Card.Header class="-m-[1px] border-b-2 border-border bg-secondary/60 px-6 py-5">
				<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<Card.Title class="text-2xl font-black">
							{#if currentRelease === -1}
								There are currently no releases
							{:else}
								Koroks in Release #{currentRelease}
							{/if}
						</Card.Title>

						<Card.Description>
							{markersFiltered.length} Korok{markersFiltered.length !== 1 ? 's' : ''} in this release
						</Card.Description>
					</div>

					<div class="ml-auto">
						<Button
							variant="secondary"
							onclick={() => {
								window.location.href = '/api/export-all-koroks';
							}}
						>
							<Download /> Export All
						</Button>

						<Button
							disabled={adding}
							onclick={() => {
								openKorok = true;

								newKorok = {
									description: '',
									lat: 42.0,
									lng: -73.0,
									number: nextNumber,
									release: currentRelease === -1 ? 0 : currentRelease,
									type: nextType,
									isRelease: false,
                                    eventId: null
								};
							}}
						>
							<Leaf /> Create Korok
						</Button>
					</div>
				</div>
			</Card.Header>

			<Card.Content class="p-4 sm:p-6">
				<div class="flex max-h-150 flex-col gap-3 overflow-auto">
					{#each markersFiltered as korok (korok.id)}
						<div
							class="rounded-xl border-2 border-border/70 bg-secondary/60 p-4 transition-all hover:border-primary hover:shadow-md"
						>
							<div class="flex flex-col gap-4 lg:flex-row lg:items-center">
								<!-- Number and description -->
								<div class="flex min-w-0 flex-1 items-center gap-4">
									<div
										class="flex size-15 shrink-0 items-center justify-center rounded-full border-2 border-border bg-card p-1 font-black"
									>
										<img
											alt="korok"
											class="h-auto max-h-full max-w-full"
											src="koroks/k_{korok.type}.png"
										/>
									</div>

									<div class="min-w-0">
										<p
											class="inline font-[hylia] text-lg tracking-wider text-muted-foreground uppercase"
										>
											Korok
										</p>

										<p class="inline font-[hylia] text-xl text-foreground">
											#{tripleNumber(korok.number)}
										</p>

										{#if korok.description}
											<p class="truncate text-sm text-muted-foreground">
												{korok.description}
											</p>
										{:else}
											<p class="text-sm text-muted-foreground italic">No description</p>
                                        {/if}
                                        {#if korok.eventId != null}
                                            <p class="mt-0.5 text-sm font-semibold">
                                                Event: {events.find((ev) => ev.id === korok.eventId)?.name ?? 'Unknown'}
                                            </p>
                                        {/if}
									</div>
								</div>

								<!-- Status -->
								<div class="flex items-center gap-2">
									<span class="text-xs font-bold tracking-wider text-muted-foreground uppercase">
										Visibility
									</span>

									<Toggle
										pressed={korok.isFindable}
										variant="outline"
										onPressedChange={async (e) => {
											await updateFindableAdmin({
												korokId: korok.id,
												isFindable: e
											});

											await markers.refresh();
										}}
									>
										{korok.isFindable ? '✓ Findable' : 'Hidden'}
									</Toggle>
								</div>

								<!-- Actions -->
								<div class="flex flex-wrap gap-2">
									<Button
										variant="outline"
										onclick={() => {
											openKorok = true;
											newKorok = {
												...korok
											};
											changeId = korok.id;
										}}
									>
										Edit
									</Button>
									<Button
										variant="destructive"
										onclick={async () => {
											if (confirm('You sure bro?')) {
												await deleteKoroksAdmin({
													id: korok.id
												});
												await markers.refresh();
											}
										}}
									>
										Delete
									</Button>
									<Button
										variant="secondary"
										onclick={async () => {
											await generateQRCode({
												id: korok.id,
												type: korok.type,
												number: korok.number
											});
										}}
									>
										Export Card
									</Button>
								</div>
							</div>
						</div>
					{/each}

					{#if markersFiltered.length === 0}
						<div class="rounded-xl border-2 border-dashed border-border p-12 text-center">
							<div class="text-4xl"></div>

							<p class="mt-3 text-lg font-bold text-foreground">No Koroks yet</p>

							<p class="mt-1 text-sm text-muted-foreground">
								Create one from the button above or place one directly on the map.
							</p>
						</div>
					{/if}
				</div>
			</Card.Content>
		</Card.Root>
	</section>
</div>

<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
	<!-- User controls -->
	<section class="mb-8">
		<Card.Root class="overflow-hidden border-2 border-border bg-card pt-0 shadow-lg">
			<Card.Header class="-m-[1px] border-b-2 border-border bg-secondary/60 px-6 py-5">
				<Card.Title class="text-2xl font-black">User Management</Card.Title>

				<Card.Description>Manage Users</Card.Description>
			</Card.Header>

			<Card.Content class="grid gap-4 p-6 md:grid-cols-3">
				<!-- Delete -->
				<div class="rounded-xl border-2 border-destructive/40 bg-destructive/10 p-5">
					<div class="mb-4">
						<p class="font-black text-foreground">Delete Player Leaderboards</p>
						<p class="mt-1 text-sm leading-5 text-muted-foreground">
							Permanently delete all player leaderboards
						</p>
					</div>

					<Button
						variant="destructive"
						class="w-full"
						onclick={async () => {
							if (confirm('Are you sure you want to delete all leaderboards?')) {
								await deleteAllLeaderBoard();
							}
						}}
					>
						Delete All Leaderboards
					</Button>
				</div>
			</Card.Content>
		</Card.Root>
	</section>

	<section>
		<Card.Root class="overflow-hidden border-2 border-border bg-card pt-0 shadow-lg">
            <Card.Header class="-m-px border-b-2 border-border bg-secondary/60 px-6 py-5">
                <div class="flex items-center justify-between">
                    <div>
                        <Card.Title class="text-2xl font-black">Hunters</Card.Title>
                        <Card.Description>Manage hunters</Card.Description>
                    </div>
                    <div class="flex flex-col items-end gap-2">
                        <div class="grow rounded-full border-2 border-border bg-background px-3 py-2 font-bold">
                            {hunterCount} Hunter{hunterCount !== 1 ? 's' : ''}
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
				<div class="flex max-h-100 flex-col gap-3 overflow-auto">
					{#each sortedPlayers as player, index (player?.user.id)}
						{@const rank = index + 1}
						<ContextMenu.Root>
							<ContextMenu.Trigger>
								<div
									class={`group relative overflow-hidden rounded-xl border-2 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${'bg-secondary/60'}`}
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
                                                class={`flex size-15 items-center justify-center rounded-full border-2 text-xl font-black ${
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
                                        </div>

										<!-- Player -->
										<div class="min-w-0 flex-1">
											<p class="break-all font-[hylia] text-xl text-foreground">
												{player.user.name}
												{#if player.user.role === 'admin'}
													<span class="inline" title="Admin"><UserLock /></span>
												{:else if player.user.role === 'muncher'}
													<span class="inline" title="Muncher"><Hamburger /></span>
												{/if}
											</p>

                                            {#if player.lastFoundAt}
                                                <p class="inline mt-0.5 text-sm text-muted-foreground">Last find:</p>
                                                <p class="inline mt-0.5 font-[hylia] text-foreground">
                                                    #{String(player.lastKorokNumber).padStart(3, '0')}
                                                </p>
                                                <p class="inline mt-0.5 text-sm text-muted-foreground">
                                                    on {formatLastFind(player.lastFoundAt)}
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
								</div></ContextMenu.Trigger
							>
							<ContextMenu.Content>
								<ContextMenu.Item
									onclick={async () => {
										playerEdit = {
											id: player.user.id,
											adminOrder: player.user.adminOrder,
											icon: player.user.icon,
											name: player.user.name,
											subrole: player.user.subrole,
											subtext: player.user.subtext
										};
										openPlayer = true;
									}}
								>
									Edit Player
								</ContextMenu.Item>
								<ContextMenu.Item
									onclick={async () => {
										if (confirm('You sure bro?')) {
											await toggleAdmin({ userid: player.user.id });
											playersPromise.refresh();
										}
									}}>Toggle Admin</ContextMenu.Item
								>
								<ContextMenu.Item
									onclick={async () => {
										if (confirm('You sure bro?')) {
											await toggleMuncher({ userid: player.user.id });
											playersPromise.refresh();
										}
									}}>Toggle Muncher</ContextMenu.Item
								>
								<ContextMenu.Item
									onclick={async () => {
										if (confirm('Are you sure you want to delete this user?')) {
											await deleteUser({ userid: player.user.id });
											playersPromise.refresh();
										}
									}}>Delete User</ContextMenu.Item
								>
								<ContextMenu.Item
									onclick={async () => {
										if (confirm("Are you sure you want to reset this user's Korok finds?")) {
											await resetUserKoroks({ userid: player.user.id });
											playersPromise.refresh();
											await invalidate('app:korok-count');
										}
									}}>Reset Korok finds</ContextMenu.Item
								>
							</ContextMenu.Content>
						</ContextMenu.Root>
					{/each}
				</div>
			</Card.Content>
		</Card.Root>
	</section>
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
<!-- Create / Edit Dialog -->
<Dialog.Root bind:open={openKorok}>
	<Dialog.Content class="max-h-[90vh] overflow-y-auto sm:max-w-lg">
		<Dialog.Header>
			<Dialog.Title class="text-2xl font-black">
				{changeId ? 'Edit Korok' : 'Create Korok'}
			</Dialog.Title>

			<Dialog.Description>
				{changeId
					? 'Update the details and visibility of this Korok.'
					: 'Add a new Korok to the current release.'}
			</Dialog.Description>
		</Dialog.Header>

		<div class="flex flex-col gap-4">
			{#if changeId}
				<div class="rounded-lg bg-muted p-3 text-sm">
					<span class="font-bold">Korok ID:</span>
					<span class="font-mono">{changeId}</span>
				</div>
			{/if}

			<div class="grid grid-cols-2 gap-4">
				<div>
					<Label for="number">Number</Label>
					<Input id="number" type="number" bind:value={newKorok.number} />
				</div>

				<div>
					<Label for="release">Release</Label>
					<Input id="release" type="number" bind:value={newKorok.release} />
				</div>
			</div>

			<div>
				<Label for="desc">Description</Label>
				<Input id="desc" bind:value={newKorok.description} placeholder="Where is this Korok?" />
			</div>

			<div class="grid grid-cols-2 gap-4">
				<div>
					<Label for="lat">Latitude</Label>
					<Input id="lat" type="number" step="any" bind:value={newKorok.lat} />
				</div>

				<div>
					<Label for="lng">Longitude</Label>
					<Input id="lng" type="number" step="any" bind:value={newKorok.lng} />
				</div>
			</div>
			<Button
				onclick={() => {
					navigator.geolocation.getCurrentPosition((pos) => {
						newKorok.lat = pos.coords.latitude;
						newKorok.lng = pos.coords.longitude;
					});
				}}>My location</Button
			>

			<div>
				<Label for="type">Korok Type</Label>

				<Select.Root
					type="single"
					bind:value={() => newKorok.type.toString(), (e) => (newKorok.type = Number(e))}
				>
					<Select.Trigger class="w-full">
						<div class="flex items-center gap-2">
							<img
								class="size-5"
								alt={`Korok ${newKorok.type}`}
								src={`/koroks/k_${newKorok.type}.png`}
							/>
							Type {newKorok.type}
						</div>
					</Select.Trigger>

					<Select.Content>
						{#each korokImages as img, i (img)}
							<Select.Item value={i.toString()}>
								<div class="flex items-center gap-2">
									<img class="size-5" alt={`Korok ${img}`} src={`/koroks/${img}`} />
									Type {i}
								</div>
							</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>
            <div>
                <Label for="event">Event</Label>
                <Select.Root
                    type="single"
                    bind:value={() =>
                        newKorok.eventId != null ? newKorok.eventId.toString() : 'none',
                    (e) => (newKorok.eventId = e === 'none' ? null : Number(e))}
                >
                    <Select.Trigger class="w-full">
                        {#if newKorok.eventId != null}
                            {events.find((ev) => ev.id === newKorok.eventId)?.name ?? 'Unknown Event'}
                        {:else}
                            None (regular Korok)
                        {/if}
                    </Select.Trigger>
                    <Select.Content>
                        <Select.Item value="none">None (regular Korok)</Select.Item>
                        {#each events as event (event.id)}
                            <Select.Item value={event.id.toString()}>
                                {event.name}
                            </Select.Item>
                        {/each}
                    </Select.Content>
                </Select.Root>
            </div>

			<div
				class="flex items-center justify-between rounded-xl border-2 border-border bg-muted/50 p-4"
			>
				<div>
					<p class="font-bold">Released</p>
					<p class="text-sm text-muted-foreground">Make this Korok part of the public release.</p>
				</div>

				<Switch id="isRelease" type="checkbox" bind:checked={newKorok.isRelease} />
			</div>
		</div>

		<Dialog.Footer>
			{#if changeId}
				<Dialog.Close
					onclick={async () => {
						await updateKoroksAdmin({
							...newKorok,
							id: changeId
						});

						await markers.refresh();
						changeId = '';
					}}
					class={cn('font-black', buttonVariants({ variant: 'default' }))}
				>
					Save Changes
				</Dialog.Close>
			{:else}
				<Button
					onclick={async () => {
						adding = true;
						await addKoroksAdmin({
							...newKorok,
							release: newKorok.release === -1 ? 0 : newKorok.release
						});
						nextNumber++;
						nextType = (nextType + 1) % 13;
						await markers.refresh();
						await adminDataPromise.refresh();
						changeId = '';
						adding = false;
						openKorok = false;
					}}
					class={buttonVariants({ variant: 'default' })}
				>
					{#if adding}<Spinner />{/if} Create Korok
				</Button>
			{/if}
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={openPlayer}>
	<Dialog.Content class="max-h-[90vh] overflow-y-auto sm:max-w-lg">
		<Dialog.Header>
			<Dialog.Title class="text-2xl font-black">Edit player</Dialog.Title>

			<Dialog.Description>Edit Player</Dialog.Description>
		</Dialog.Header>

		<div class="flex flex-col gap-4">
			<div class="rounded-lg bg-muted p-3 text-sm">
				<span class="font-bold">Player ID:</span>
				<span class="font-mono">{changeId}</span>
			</div>

			<div>
				<Label for="name">Name</Label>
				<Input id="name" bind:value={playerEdit.name} placeholder="Player Name" />
			</div>
			<div>
				<Label for="subrole">Subrole</Label>
				<Input id="subrole" bind:value={playerEdit.subrole} placeholder="Subrole" />
			</div>
			<div>
				<Label for="subtext">Subtext</Label>
				<Input id="subtext" bind:value={playerEdit.subtext} placeholder="Subtext" />
			</div>
			<div>
				<Label for="adminOrder">Admin Order</Label>
				<Input
					id="adminOrder"
					type="number"
					bind:value={playerEdit.adminOrder}
					placeholder="Order"
				/>
			</div>

			<div>
				<Label for="type">Korok Type</Label>

				<Select.Root type="single" bind:value={playerEdit.icon}>
					<Select.Trigger class="w-full">
						<div class="flex items-center gap-2">
							{#if playerEdit.icon}
								<img class="size-5" alt={`Korok ${playerEdit.icon}`} src={`${playerEdit.icon}`} />
								Icon {playerEdit.icon}
							{:else}
								No Icon
							{/if}
						</div>
					</Select.Trigger>

					<Select.Content>
						<Select.Item value="">
							<div class="flex items-center gap-2">No Icon</div>
						</Select.Item>
						{#each iconImages as icon (icon)}
							<Select.Item value={icon}>
								<div class="flex items-center gap-2">
									<img class="size-5" alt={`Korok ${icon}`} src={`${icon}`} />
									Icon {icon}
								</div>
							</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>

			<Dialog.Footer>
				<Dialog.Close
					onclick={async () => {
						await editPlayer({
							...playerEdit
						});

						await playersPromise.refresh();
					}}
					class={cn('font-black', buttonVariants({ variant: 'default' }))}
				>
					Save Changes
				</Dialog.Close>
			</Dialog.Footer>
		</div></Dialog.Content
	>
</Dialog.Root>
<Dialog.Root bind:open={openEvent}>
    <Dialog.Content class="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <Dialog.Header>
            <Dialog.Title class="text-2xl font-black">
                {changeEventId ? 'Edit Event' : 'Create Event'}
            </Dialog.Title>
            <Dialog.Description>
                {changeEventId
                    ? 'Update this event\'s details and status.'
                    : 'Add a new event for special Korok hunts.'}
            </Dialog.Description>
        </Dialog.Header>

        <div class="flex flex-col gap-4">
            <div>
                <Label for="event-name">Name</Label>
                <Input id="event-name" bind:value={eventEdit.name} placeholder="Event name" />
            </div>

            <div>
                <Label for="event-desc">Description</Label>
                <Input id="event-desc" bind:value={eventEdit.description} placeholder="Description" />
            </div>

            <div>
                <Label for="event-bg">Background Image Path</Label>
                <Input
                    id="event-bg"
                    bind:value={eventEdit.backgroundImage}
                    placeholder="/events/spring-hunt.png"
                />
                <p class="mt-1 text-xs text-muted-foreground">
                    Path to a file in <code>/static</code>. Leave blank for the default card.
                </p>
            </div>

            <div
                class="flex items-center justify-between rounded-xl border-2 border-border bg-muted/50 p-4"
            >
                <div>
                    <p class="font-bold">Active</p>
                    <p class="text-sm text-muted-foreground">Show this event as currently running.</p>
                </div>
                <Switch id="isActive" type="checkbox" bind:checked={eventEdit.isActive} />
            </div>
            <div
                class="flex items-center justify-between rounded-xl border-2 border-border bg-muted/50 p-4"
            >
                <div>
                    <p class="font-bold">Visible</p>
                    <p class="text-sm text-muted-foreground">
                        Show this event on the public events page. Turn off to keep it hidden while building.
                    </p>
                </div>
                <Switch id="isVisible" type="checkbox" bind:checked={eventEdit.isVisible} />
            </div>
        </div>

        <Dialog.Footer>
            <Dialog.Close
                onclick={async () => {
                    const payload = {
                        ...eventEdit,
                        backgroundImage: eventEdit.backgroundImage?.trim() ? eventEdit.backgroundImage : null
                    };
                    if (changeEventId) {
                        await updateEvent({ id: changeEventId, ...payload });
                    } else {
                        await addEvent(payload);
                    }
                    await eventsPromise.refresh();
                    changeEventId = null;
                }}
                class={cn('font-black', buttonVariants({ variant: 'default' }))}
            >
                {changeEventId ? 'Save Changes' : 'Create Event'}
            </Dialog.Close>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>
