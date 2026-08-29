import type { StyleSpecification } from 'maplibre-gl';
import * as env from '$app/env/public';

export const zeldaStyle: StyleSpecification = {
	version: 8,

	sources: {
		osm: {
			type: 'vector',
			tiles: [env.ORIGIN + '/tiles/{z}/{x}/{y}.pbf'],
			minzoom: 13,
			maxzoom: 16
		},
		contours: {
			type: 'geojson',
			data: '/contours.geojson'
		}
	},

	layers: [
		// ============================================================
		// BASE TERRAIN
		// ============================================================

		{
			id: 'background',
			type: 'background',
			paint: {
				'background-color': '#766b3d'
			}
		},
		{
			id: 'contours',
			type: 'line',
			source: 'contours',
			'source-layer': 'contours',

			paint: {
				'line-color': '#8f7654',
				'line-width': 1,
				'line-opacity': 0.45
			}
		},
		{
			id: 'landcover',
			type: 'fill',
			source: 'osm',
			'source-layer': 'landcover',
			paint: {
				'fill-color': [
					'match',
					['get', 'subclass'],

					// Forest
					'wood',
					'#5d5330',

					// Grass
					'grass',
					'#817647',

					// Scrub
					'scrub',
					'#74683d',

					// Wetland
					'wetland',
					'#697044',

					// Farmland
					'farmland',
					'#827746',

					// Default
					'#766b3d'
				],

				'fill-opacity': 0.8
			}
		},

		// ============================================================
		// PARKS / NATURAL AREAS
		// ============================================================

		{
			id: 'park',
			type: 'fill',
			source: 'osm',
			'source-layer': 'park',
			paint: {
				'fill-color': '#68603a',
				'fill-opacity': 0.55
			}
		},

		{
			id: 'landuse',
			type: 'fill',
			source: 'osm',
			'source-layer': 'landuse',
			paint: {
				'fill-color': [
					'match',
					['get', 'class'],

					'park',
					'#69613a',

					'forest',
					'#5b512f',

					'cemetery',
					'#68613f',

					'industrial',
					'#716741',

					'residential',
					'#786d43',

					'commercial',
					'#786d43',

					'#766b3d'
				],

				'fill-opacity': 0.5
			}
		},

		// ============================================================
		// WATER
		// ============================================================

		{
			id: 'water',
			type: 'fill',
			source: 'osm',
			'source-layer': 'water',
			paint: {
				'fill-color': '#405765',
				'fill-opacity': 1
			}
		},

		{
			id: 'waterway',
			type: 'line',
			source: 'osm',
			'source-layer': 'waterway',
			paint: {
				'line-color': '#405765',
				'line-width': ['interpolate', ['linear'], ['zoom'], 13, 1, 15, 2.5, 16, 4],

				'line-opacity': 0.9
			}
		},

		// ============================================================
		// ROADS
		// ============================================================

		/*
		 * Dark outline underneath roads.
		 * This gives the roads the hand-drawn look from the Zelda map.
		 */

		{
			id: 'roads-outline',
			type: 'line',
			source: 'osm',
			'source-layer': 'transportation',

			paint: {
				'line-color': '#514829',

				'line-width': [
					'match',
					['get', 'class'],

					'primary',
					4.5,

					'secondary',
					4,

					'tertiary',
					3.5,

					'residential',
					3,

					'unclassified',
					2.5,

					'service',
					2,

					'path',
					1.5,

					'footway',
					1.5,

					'pedestrian',
					1.5,

					'cycleway',
					1.5,

					'track',
					1.5,

					2
				],

				'line-opacity': 0.9
			}
		},

		{
			id: 'roads',
			type: 'line',
			source: 'osm',
			'source-layer': 'transportation',

			paint: {
				'line-color': [
					'match',
					['get', 'class'],

					'primary',
					'#d8c98b',

					'secondary',
					'#d4c486',

					'tertiary',
					'#d0bf82',

					'residential',
					'#c8b775',

					'unclassified',
					'#b9a968',

					'service',
					'#ad9d60',

					'path',
					'#9d8d57',

					'footway',
					'#9d8d57',

					'pedestrian',
					'#9d8d57',

					'cycleway',
					'#9d8d57',

					'track',
					'#a6955b',

					'#b9a968'
				],

				'line-width': [
					'match',
					['get', 'class'],

					'primary',
					3,

					'secondary',
					2.6,

					'tertiary',
					2.2,

					'residential',
					1.8,

					'unclassified',
					1.5,

					'service',
					1.2,

					'path',
					0.8,

					'footway',
					0.8,

					'pedestrian',
					0.8,

					'cycleway',
					0.8,

					'track',
					0.9,

					1.5
				],

				'line-opacity': 1
			}
		},

		/*
		 * Footpaths are thinner and slightly darker.
		 */

		{
			id: 'paths',
			type: 'line',
			source: 'osm',
			'source-layer': 'transportation',

			filter: ['==', ['get', 'class'], 'path'],

			paint: {
				'line-color': '#958550',

				'line-width': ['interpolate', ['linear'], ['zoom'], 13, 0.5, 14, 0.7, 15, 1, 16, 1.5],

				'line-dasharray': [2, 2]
			}
		},

		// ============================================================
		// BUILDINGS
		// ============================================================

		{
			id: 'buildings',
			type: 'fill',
			source: 'osm',
			'source-layer': 'building',

			paint: {
				'fill-color': '#4f432b',
				'fill-opacity': 0.9
			}
		},

		{
			id: 'building-outline',
			type: 'line',
			source: 'osm',
			'source-layer': 'building',

			paint: {
				'line-color': '#342c1d',
				'line-width': 0.7,
				'line-opacity': 0.8
			}
		},

		// ============================================================
		// PLACES
		// ============================================================

		{
			id: 'place-labels',
			type: 'symbol',
			source: 'osm',
			'source-layer': 'place',

			layout: {
				'text-field': ['coalesce', ['get', 'name:latin'], ['get', 'name']],

				'text-size': ['interpolate', ['linear'], ['zoom'], 13, 11, 14, 13, 16, 16],

				'text-font': ['Open Sans Regular'],

				'text-letter-spacing': 0.02,

				'text-anchor': 'center'
			},

			paint: {
				'text-color': '#e5d486',

				'text-halo-color': '#4c4228',

				'text-halo-width': 1.5,

				'text-halo-blur': 0.3
			}
		},

		// ============================================================
		// ROAD LABELS
		// ============================================================

		{
			id: 'road-labels',
			type: 'symbol',
			source: 'osm',
			'source-layer': 'transportation_name',

			layout: {
				'text-field': ['coalesce', ['get', 'name:latin'], ['get', 'name']],

				'symbol-placement': 'line',

				'text-size': ['interpolate', ['linear'], ['zoom'], 13, 9, 15, 11, 16, 12],

				'text-letter-spacing': 0.04
			},

			paint: {
				'text-color': '#d2c47e',

				'text-halo-color': '#554a2d',

				'text-halo-width': 1.2
			}
		},

		// ============================================================
		// POI LABELS
		// ============================================================

		{
			id: 'poi-labels',
			type: 'symbol',
			source: 'osm',
			'source-layer': 'poi',

			layout: {
				'text-field': ['coalesce', ['get', 'name:latin'], ['get', 'name']],

				'text-size': ['interpolate', ['linear'], ['zoom'], 13, 9, 15, 11, 16, 12],

				'text-anchor': 'top'
			},

			paint: {
				'text-color': '#d8c77e',

				'text-halo-color': '#4b4028',

				'text-halo-width': 1.2
			}
		}
	]
};
