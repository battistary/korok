export const load = async ({ url }) => {
	const id = url.searchParams.get('id');
	return { id };
};
