import { Link } from '@inertiajs/react';
import { BookOpen, Compass, LayoutGrid, Cpu, Camera } from 'lucide-react';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { create as timeTicketsCreate } from '@/routes/time-tickets';
import type { NavItem } from '@/types';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Capturar Ponto',
        href: timeTicketsCreate(),
        icon: Camera,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'CSS Tailwinds',
        href: 'https://tailwindcss.com/',
        icon: Compass,
    },
    {
        title: 'Icons Select',
        href: 'https://lucide.dev/icons/',
        icon: BookOpen,
    },
    {
        title: 'Developer',
        href: 'https://github.com/luizvigiato',
        icon: Cpu,
    }
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
