<script lang="ts">
	import Map from '#lib/components/map/map.svelte';
	import * as Card from '$lib/components/ui/card/';
	import { getAreas, getNonRemovedKoroks, markKorokRemoved } from '../query/korok.remote';

	let areas = getAreas();
	let markers = getNonRemovedKoroks();
</script>

<div class="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
	<!-- Map -->
	<section class="mb-8">
		<div class="mb-4 px-2">
			<h2 class="mt-1 text-3xl font-black text-foreground sm:text-4xl">Clean up the Koroks</h2>

			<p class="mt-1 text-muted-foreground">
				Right click on a Korok to open context menu. This will allow you to delete it or see its
				description.
			</p>
		</div>

		<Card.Root class="overflow-hidden border-2 border-border bg-card p-2 shadow-xl sm:p-3">
			<div class="overflow-hidden rounded-2xl">
				<Map
					actions={{ deleteKoroks: true, seeDescription: true }}
					onDeleteKorok={async (e) => {
						await markKorokRemoved({ korokId: e });
						markers.refresh();
					}}
					getDescription={async (e) => {
						return (
							((await markers).find((m) => m.id === e)?.description ||
								'No description available') ??
							''
						);
					}}
					markers={markers.current ?? []}
					areas={areas.current ?? []}
				/>
			</div>
		</Card.Root>
	</section>
</div>
