<script lang="ts" module>
	export type Area = {
		points: [number, number][];
		color: string;
		id: number;
	};

	export type MarkerK = {
		lng: number;
		lat: number;
		number: number;
		id: string;
	};
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import * as maplibregl from 'maplibre-gl';
	import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
	import {
		type Map as MapLibreMap,
		type MapMouseEvent,
		type MapLayerMouseEvent,
		type GeoJSONSource
	} from 'maplibre-gl';

	import type { FeatureCollection, Point, Polygon, LineString } from 'geojson';

	import * as Card from '../ui/card/';
	import { Button } from '../ui/button';
	import { Badge } from '../ui/badge';
	import { cn, tripleNumber } from '$lib/utils';
	import { zeldaStyle } from './zelda-style';
	import { browser } from '$app/env';

	let element: HTMLElement;
	let currentDescription: string = $state('');
	let {
		markers,
		areas,
		actions = {
			deleteKoroks: false,
			deleteAreas: false,
			newKoroks: false,
			newAreas: false,
			seeDescription: false
		},
		onNewArea,
		onDeleteArea,
		onNewKorok,
		onDeleteKorok,
		getDescription
	}: {
		markers: MarkerK[];
		areas?: Area[];
		actions?: {
			deleteKoroks?: boolean;
			deleteAreas?: boolean;
			newKoroks?: boolean;
			newAreas?: boolean;
			seeDescription?: boolean;
		};
		onNewArea?: (area: Area) => void;
		getDescription?: (id: string) => Promise<string>;
		onDeleteArea?: (id: number) => void;
		onNewKorok?: (pos: [number, number]) => void;
		onDeleteKorok?: (id: string) => void;
	} = $props();

	let longPressTimer: ReturnType<typeof setTimeout> | undefined;
	let longPressTriggered = false;

	let map: MapLibreMap;
	let mounted = $state(false);

	let clickMode: '' | 'new-korok' | 'new-area' = $state('');

	let newCurrentArea: {
		points: [number, number][];
		closed: boolean;
		color: string;
	} = $state({
		points: [],
		closed: false,
		color: ''
	});

	let newPointMarkers: maplibregl.Marker[] = [];

	let polyContext:
		| {
				open: boolean;
				x: number;
				y: number;
				id: number;
				type: 'area';
		  }
		| {
				open: boolean;
				x: number;
				y: number;
				id: string;
				type: 'korok';
		  } = $state({
		open: false,
		x: 0,
		y: 0,
		id: 0,
		type: 'area'
	});

	let isMobile = $state(false);

	const mediaQuery = browser ? window.matchMedia('(max-width: 640px)') : null;

	const changeMedia = (e: MediaQueryListEvent) => {
		isMobile = e.matches;
	};

	/*
	 * ================================================================
	 * GEOJSON
	 * ================================================================
	 */

	function createKorokGeoJSON(markers: MarkerK[]): FeatureCollection<Point> {
		return {
			type: 'FeatureCollection',
			features: markers.map((marker) => ({
				type: 'Feature',
				geometry: {
					// GeoJSON / MapLibre = [longitude, latitude]
					type: 'Point',
					coordinates: [marker.lng, marker.lat]
				},
				properties: {
					id: marker.id,
					number: '#' + tripleNumber(marker.number)
				}
			}))
		};
	}

	function createAreaGeoJSON(areas: Area[] | undefined): FeatureCollection<Polygon> {
		return {
			type: 'FeatureCollection',
			features: (areas ?? [])
				.filter((area) => area.points.length >= 3)
				.map((area) => {
					const coordinates = area.points.map(([lat, lng]) => [lng, lat] as [number, number]);

					/*
					 * GeoJSON polygons must be closed.
					 */
					coordinates.push(coordinates[0]);

					return {
						type: 'Feature',
						geometry: {
							type: 'Polygon',
							coordinates: [coordinates]
						},
						properties: {
							id: area.id,
							color: area.color
						}
					};
				})
		};
	}

	/*
	 * ================================================================
	 * KOROK SOURCE
	 * ================================================================
	 */

	function updateKoroks() {
		if (!map || !mounted) return;

		const source = map.getSource('koroks') as GeoJSONSource | undefined;

		if (!source) return;

		source.setData(createKorokGeoJSON(markers));
	}

	/*
	 * ================================================================
	 * AREAS
	 * ================================================================
	 */

	function updateAreas() {
		if (!map || !mounted) return;

		const source = map.getSource('areas') as GeoJSONSource | undefined;

		if (!source) return;

		source.setData(createAreaGeoJSON(areas));
	}

	/*
	 * ================================================================
	 * AREA CONTEXT MENU
	 * ================================================================
	 */

	function onAreaContextMenu(e: MapLayerMouseEvent) {
		if (!actions.deleteAreas) return;

		const feature = e.features?.[0];

		if (!feature) return;

		const id = Number(feature.properties?.id);

		if (!Number.isFinite(id)) return;
		polyContext = {
			open: true,
			x: e.originalEvent.clientX,
			y: e.originalEvent.clientY + document.documentElement.scrollTop,
			id,
			type: 'area'
		};
	}

	/*
	 * ================================================================
	 * KOROK CONTEXT MENU
	 * ================================================================
	 */

	function onKorokContextMenu(e: MapLayerMouseEvent) {
		if (!actions.deleteKoroks && !actions.seeDescription) return;
		const feature = e.features?.[0];

		if (!feature) return;

		const id = feature.properties?.id;

		if (!id) return;

		polyContext = {
			open: true,
			x: e.originalEvent.clientX,
			y: e.originalEvent.clientY + document.documentElement.scrollTop,
			id: String(id),
			type: 'korok'
		};
	}

	/*
	 * ================================================================
	 * NEW AREA
	 * ================================================================
	 */

	function updateNewArea() {
		if (!map || !mounted) return;

		const source = map.getSource('new-area') as GeoJSONSource | undefined;

		if (!source) return;

		const coordinates = newCurrentArea.points.map(([lat, lng]) => [lng, lat] as [number, number]);

		const data: FeatureCollection<LineString> = {
			type: 'FeatureCollection',
			features:
				coordinates.length > 0
					? [
							{
								type: 'Feature',
								geometry: {
									type: 'LineString',
									coordinates
								},
								properties: {}
							}
						]
					: []
		};

		source.setData(data);

		updateNewPointMarkers();
	}

	function updateNewPointMarkers() {
		clearNewPointMarkers();

		for (const [index, point] of newCurrentArea.points.entries()) {
			const button = document.createElement('button');

			button.type = 'button';

			button.className =
				'flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-primary text-xs font-bold text-primary-foreground shadow-lg';

			button.textContent = index === 0 && newCurrentArea.points.length >= 3 ? '✓' : '+';

			button.addEventListener('click', (event) => {
				event.stopPropagation();

				if (index === 0 && newCurrentArea.points.length >= 3) {
					finishNewArea();
				}
			});

			const marker = new maplibregl.Marker({
				element: button,
				anchor: 'center'
			})
				.setLngLat([point[1], point[0]])
				.addTo(map);

			newPointMarkers.push(marker);
		}
	}

	function clearNewPointMarkers() {
		for (const marker of newPointMarkers) {
			marker.remove();
		}

		newPointMarkers = [];
	}

	function finishNewArea() {
		if (newCurrentArea.points.length < 3) return;

		newCurrentArea.closed = true;

		onNewArea?.({
			color: newCurrentArea.color,
			points: [...newCurrentArea.points],
			id: 0
		});

		clearNewPointMarkers();

		newCurrentArea = {
			closed: false,
			color: '',
			points: []
		};

		clickMode = '';

		updateNewArea();
	}

	/*
	 * ================================================================
	 * MAP CLICK
	 * ================================================================
	 */

	function onMapClick(e: MapMouseEvent) {
		polyContext.open = false;

		if (clickMode === 'new-korok' && actions.newKoroks) {
			/*
			 * MapLibre gives us longitude/latitude.
			 *
			 * Your application API expects latitude/longitude.
			 */
			onNewKorok?.([e.lngLat.lat, e.lngLat.lng]);

			clickMode = '';

			return;
		}

		if (clickMode === 'new-area' && actions.newAreas) {
			/*
			 * Keep your application's [lat, lng] format.
			 */
			newCurrentArea.points.push([e.lngLat.lat, e.lngLat.lng]);

			updateNewArea();
		}
	}

	/*
	 * ================================================================
	 * INITIALIZATION
	 * ================================================================
	 */

	onMount(() => {
		if (!browser) return;

		mediaQuery?.addEventListener('change', changeMedia);

		isMobile = mediaQuery?.matches ?? false;
		maplibregl.setWorkerUrl(workerUrl);
		map = new maplibregl.Map({
			container: element,

			style: zeldaStyle,
			/*
			 * MapLibre = [longitude, latitude]
			 */
			center: [-73.68059092559635, 42.72961061168427],

			zoom: isMobile ? 14.3 : 15,

			minZoom: 13,
			maxZoom: 17,

			/*
			 * southwest -> northeast
			 *
			 * Each coordinate is [lng, lat].
			 */
			maxBounds: [
				[-73.7013291, 42.719666],
				[-73.6583636, 42.740336]
			],
			rollEnabled: false,
			// pitchWithRotate: false,
			attributionControl: {
				compact: true
			},
			doubleClickZoom: false
		});

		map.addControl(new maplibregl.NavigationControl(), 'top-right');

		const loadMap = () => {
			console.log('Map load handler running'); // <-- check this on Vercel
			// ========================================================
			// KOROKS
			// ========================================================

			if (!map.getSource('koroks')) {
				map.addSource('koroks', {
					type: 'geojson',
					data: createKorokGeoJSON(markers)
				});
			}

			/*
			 * You'll need korok.png/svg added to the map later.
			 * For now, use circles so we don't depend on an image.
			 */
			map.loadImage('/seed.png').then((img) => {
				if (!map.hasImage('korok')) {
					map.addImage('korok', img.data);
				}
				if (!map.getLayer('korok-markers')) {
					map.addLayer({
						id: 'korok-markers',
						type: 'symbol',
						source: 'koroks',
						layout: {
							'icon-image': 'korok',
							'icon-size': 1
						}
					});
				}
			});

			/*
			 * Korok numbers.
			 */
			if (!map.getLayer('korok-numbers')) {
				map.addLayer({
					id: 'korok-numbers',
					type: 'symbol',
					source: 'koroks',
					layout: {
						'text-field': ['to-string', ['get', 'number']],
						'text-size': 15,
						'text-offset': [0, 1.5],
						'text-anchor': 'top'
					},
					paint: {
						'text-color': '#4d3d29',
						'text-halo-color': '#d8c99f',
						'text-halo-width': 1.5
					}
				});
			}

			// ========================================================
			// AREAS
			// ========================================================

			if (!map.getSource('areas')) {
				map.addSource('areas', {
					type: 'geojson',
					data: createAreaGeoJSON(areas)
				});
			}

			if (!map.getLayer('areas-fill')) {
				map.addLayer({
					id: 'areas-fill',
					type: 'fill',
					source: 'areas',
					paint: {
						'fill-color': '#174475',
						'fill-opacity': 0.15
					}
				});
			}

			if (!map.getLayer('areas-outline')) {
				map.addLayer({
					id: 'areas-outline',
					type: 'line',
					source: 'areas',
					paint: {
						'line-color': '#1e5670',
						'line-width': 4,
						'line-opacity': 0.6
					}
				});
			}

			// ========================================================
			// NEW AREA
			// ========================================================

			if (!map.getSource('new-area')) {
				map.addSource('new-area', {
					type: 'geojson',
					data: {
						type: 'FeatureCollection',
						features: []
					}
				});
			}

			if (!map.getLayer('new-area-line')) {
				map.addLayer({
					id: 'new-area-line',
					type: 'line',
					source: 'new-area',
					paint: {
						'line-color': '#b33a3a',
						'line-width': 3,
						'line-dasharray': [2, 2]
					}
				});
			}

			// ========================================================
			// EVENTS
			// ========================================================

			// Remove old listeners to avoid duplicates (optional)
			map.off('click', onMapClick);
			map.off('contextmenu', 'areas-fill', onAreaContextMenu);
			map.off('contextmenu', 'korok-markers', onKorokContextMenu);

			map.on('click', onMapClick);
			map.on('contextmenu', 'areas-fill', onAreaContextMenu);
			map.on('contextmenu', 'korok-markers', onKorokContextMenu);

			map.on('touchstart', 'korok-markers', (e) => {
				if (e.originalEvent.touches.length !== 1) return;

				longPressTriggered = false;

				longPressTimer = setTimeout(() => {
					longPressTriggered = true;
				}, 500);
			});

			map.on('touchmove', () => {
				clearTimeout(longPressTimer);
			});

			map.on('touchend', 'korok-markers', (e) => {
				if (longPressTriggered) {
					console.log(e);
					onKorokContextMenu(e);
				}
				clearTimeout(longPressTimer);
			});

			mounted = true;
			console.log('Map load handler finished');
		};

		// Attach to load event
		map.on('load', loadMap);

		// If the style is already loaded, run immediately
		if (map.isStyleLoaded()) {
			loadMap();
		}

		return () => {
			clearNewPointMarkers();

			map?.remove();

			mediaQuery?.removeEventListener('change', changeMedia);
		};
	});

	/*
	 * ================================================================
	 * SVELTE REACTIVITY
	 * ================================================================
	 */

	$effect(() => {
		if (!browser || !mounted) return;

		updateKoroks();
	});

	$effect(() => {
		if (!browser || !mounted) return;

		updateAreas();
	});

	$effect(() => {
		if (!browser || !mounted) return;

		updateNewArea();
	});
</script>

<div class="flex flex-col items-center">
	<div
		class={cn('container h-100 w-full', {})}
		style:cursor={clickMode === 'new-area' || clickMode === 'new-korok' ? 'crosshair' : 'default'}
		bind:this={element}
	></div>

	{#if polyContext.open}
		<Card.Root
			style="left:{polyContext.x}px; top:{polyContext.y}px;"
			class="absolute z-1000 flex flex-col gap-0 rounded p-2"
		>
			{#if actions.seeDescription}
				<Button
					variant="ghost"
					onclick={async () => {
						if (polyContext.type === 'area') {
							polyContext.open = false;
						} else if (polyContext.type === 'korok' && getDescription) {
							currentDescription = await getDescription(polyContext.id);
							polyContext.open = false;
						}
					}}
				>
					See Description
				</Button>
			{/if}
			<Button
				variant="ghost"
				onclick={() => {
					if (polyContext.type === 'area' && onDeleteArea) {
						onDeleteArea(polyContext.id);
						polyContext.open = false;
					} else if (polyContext.type === 'korok' && onDeleteKorok) {
						onDeleteKorok(polyContext.id);
						polyContext.open = false;
					}
				}}
			>
				Delete
			</Button>
		</Card.Root>
	{/if}

	{#if actions.newAreas || actions.newKoroks}
		<Card.Root class="flex flex-row items-center rounded-none p-2">
			<Badge variant="default" class="h-8 w-30">
				Mode: {clickMode || 'No Action'}
			</Badge>
			{#if actions.newAreas}
				<Button
					onclick={() => {
						clickMode = 'new-area';

						newCurrentArea = {
							closed: false,
							points: [],
							color: 'rgba(22, 234, 237, 0.23)'
						};

						polyContext.open = false;
					}}
				>
					New Area
				</Button>
			{/if}
			{#if actions.newKoroks}
				<Button
					onclick={() => {
						clickMode = 'new-korok';
						polyContext.open = false;
					}}
				>
					New Korok
				</Button>
			{/if}
		</Card.Root>
	{/if}
	{#if currentDescription}
		<Card.Root class="flex flex-row items-center rounded-none p-2">
			{currentDescription}
		</Card.Root>
	{/if}
</div>

<style>
	:global(.maplibregl-map) {
		font-family: inherit;
	}

	:global(.maplibregl-canvas) {
		outline: none;
	}

	:global(.maplibregl-ctrl-group) {
		border-radius: 0.5rem;
		overflow: hidden;
	}

	:global(.maplibregl-ctrl-group button) {
		background: hsl(var(--background));
		color: hsl(var(--foreground));
	}
</style>
