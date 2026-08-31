<script lang="ts">
	import { Label } from '$lib/components/ui/label/';
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
	import Input from '#lib/components/ui/input/input.svelte';
	import Button from '#lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card/';
	import * as Tabs from '$lib/components/ui/tabs/';

	let { form }: { form: ActionData } = $props();
</script>

<form method="post" action="?/signInEmail" use:enhance>
	<div class="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
		<div class="w-full max-w-md">
			<!-- Branding -->
			<div class="mb-8 text-center">
				<div
					class="mx-auto mb-5 flex size-20 items-center justify-center rounded-full border-4 border-border bg-secondary shadow-lg"
				>
					<img
						src="/koroks/k_{Math.round(Math.random() * 12)}.png"
						alt="Korok"
						class="size-14 object-contain"
					/>
				</div>

				<p class="mb-2 text-sm font-black tracking-[0.3em] text-accent uppercase">RPI Korok Hunt</p>

				<h1 class="text-5xl font-black tracking-tight text-foreground">Welcome, Hunter</h1>

				<p class="mt-3 text-muted-foreground">Sign in to track your Korok discoveries.</p>
			</div>

			<!-- Auth Card -->
			<Card.Root class="overflow-hidden border-2 border-border bg-card pt-0 shadow-xl">
				<Tabs.Root value="login">
					<Card.Header class="-m-[1px] border-b-2 border-border bg-secondary/40 px-6 pt-6">
						<Tabs.List class="grid w-full grid-cols-2">
							<Tabs.Trigger value="login" class="font-bold">Login</Tabs.Trigger>

							<Tabs.Trigger value="register" class="font-bold">Register</Tabs.Trigger>
						</Tabs.List>
					</Card.Header>

					<Card.Content class="px-6 py-6">
						<!-- Login -->
						<Tabs.Content value="login">
							<div class="flex flex-col gap-5">
								<div>
									<Label for="login-email">Email</Label>

									<Input
										id="login-email"
										type="email"
										name="email"
										autocomplete="email"
										placeholder="you@example.com"
										class="mt-2 h-11"
									/>
								</div>

								<div>
									<div class="flex items-center justify-between">
										<Label for="login-password">Password</Label>
									</div>

									<Input
										id="login-password"
										type="password"
										name="password"
										autocomplete="current-password"
										class="mt-2 h-11"
									/>
								</div>

								{#if form?.message}
									<div
										class="rounded-lg border-2 border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive"
									>
										{form.message}
									</div>
								{/if}

								<Button type="submit" class="h-11 w-full text-base font-bold">Login</Button>
							</div>
						</Tabs.Content>

						<!-- Register -->
						<Tabs.Content value="register">
							<div class="flex flex-col gap-5">
								<div>
									<Label for="register-name">Username</Label>

									<Input
										id="register-name"
										name="name-reg"
										autocomplete="username-reg"
										placeholder="KorokHunter"
										class="mt-2 h-11"
									/>
								</div>

								<div>
									<Label for="register-email">Email</Label>

									<Input
										id="register-email"
										type="email"
										name="email-reg"
										autocomplete="email"
										placeholder="you@example.com"
										class="mt-2 h-11"
									/>
								</div>

								<div>
									<Label for="register-password">Password</Label>

									<Input
										id="register-password"
										type="password"
										name="password-reg"
										autocomplete="new-password"
										class="mt-2 h-11"
									/>
								</div>

								{#if form?.message}
									<div
										class="rounded-lg border-2 border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive"
									>
										{form.message}
									</div>
								{/if}

								<Button
									type="submit"
									formaction="?/signUpEmail"
									class="h-11 w-full text-base font-bold"
								>
									Create Account
								</Button>
							</div>
						</Tabs.Content>
					</Card.Content>

					<Card.Footer class="border-t-2 border-border bg-background/40 px-6 py-4 -mb-[26px]">
						<p class="w-full text-center text-xs leading-5 text-muted-foreground">
							By joining the hunt, you'll be able to track your discoveries and compete on the
							leaderboard.
						</p>
					</Card.Footer>
				</Tabs.Root>
			</Card.Root>

			<!-- Bottom decoration -->
			<div
				class="mt-6 flex items-center justify-center gap-3 text-sm font-bold text-muted-foreground"
			>
				<span>Find them all</span>
				<span>•</span>
				<span>Climb the leaderboard</span>
			</div>
		</div>
	</div>
</form>
