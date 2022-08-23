import React from 'react'

const routes = [
	{
		path: "/",
		component: React.lazy(() => import('../../components/home/Home')),
		exact: true,
	},
	{
		path: "/index.html",
		component: React.lazy(() => import('../../components/home/Home')),
		exact: true,
	},
];

export default routes;
