import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SWRConfig } from 'swr';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReactElement } from 'react';
import GamesPage from '@/app/baseball/ncaab/games/page';
import StandingsPage from '@/app/baseball/ncaab/standings/page';
import { mockGames, standingsByConference } from '@/app/baseball/ncaab/lib/mock-data';

vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) => (
    <a href={typeof href === 'string' ? href : '#'} {...props}>
      {children}
    </a>
  )
}));

const renderWithSWR = (ui: ReactElement) =>
  render(<SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>{ui}</SWRConfig>);

const mockResponse = <T,>(data: T) =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve(data)
  } as Response);

describe('NCAA baseball surfaces', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders live game data from the API', async () => {
    const fetchMock = vi.spyOn(global, 'fetch' as any).mockImplementation(() =>
      mockResponse({
        games: mockGames,
        meta: { lastUpdated: '2025-04-05T18:59:00Z', nextUpdateSeconds: 30 }
      })
    );

    renderWithSWR(<GamesPage />);

    expect(fetchMock).toHaveBeenCalledWith('/api/v1/games', expect.any(Object));

    await screen.findByText(/LSU Tigers/i);
    expect(screen.getByText(/Oklahoma State Cowboys/)).toBeInTheDocument();
    expect(screen.getByText(/SEC Network/)).toBeInTheDocument();
  });

  it('switches conference standings when a new conference is selected', async () => {
    const fetchMock = vi.spyOn(global, 'fetch' as any).mockImplementation((input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.url;
      if (url.includes('/api/v1/standings/acc')) {
        return mockResponse(standingsByConference['acc']);
      }
      return mockResponse(standingsByConference['sec']);
    });

    renderWithSWR(<StandingsPage />);

    const secLeaders = await screen.findAllByText(/LSU Tigers/);
    expect(secLeaders.length).toBeGreaterThan(0);
    expect(fetchMock).toHaveBeenCalledWith('/api/v1/standings/sec', expect.any(Object));

    const select = screen.getByLabelText(/conference/i);
    await userEvent.selectOptions(select, 'acc');

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith('/api/v1/standings/acc', expect.any(Object)));
    const accLeaders = await screen.findAllByText(/Wake Forest Demon Deacons/);
    expect(accLeaders.length).toBeGreaterThan(0);
  });

  it('shows loading, empty, and error fallbacks on mobile breakpoints', async () => {
    const matchMedia = vi.spyOn(window, 'matchMedia');
    matchMedia.mockImplementation((query: string) => ({
      matches: query.includes('max-width: 767px'),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    } as unknown as MediaQueryList));

    const fetchMock = vi.spyOn(global, 'fetch' as any);

    fetchMock.mockImplementationOnce(() => new Promise(() => {}));
    const loadingRender = renderWithSWR(<GamesPage />);
    expect(screen.getByText(/Loading live games/i).closest('[data-view="mobile"]')).toBeTruthy();
    loadingRender.unmount();

    fetchMock.mockReset();
    fetchMock.mockImplementationOnce(() =>
      mockResponse({ games: [], meta: { lastUpdated: '2025-04-05T18:59:00Z', nextUpdateSeconds: 30 } })
    );
    const emptyRender = renderWithSWR(<GamesPage />);
    await screen.findByText(/No live games right now/i);
    expect(screen.getByText(/View standings/).closest('[data-view="mobile"]')).toBeTruthy();
    emptyRender.unmount();

    fetchMock.mockReset();
    fetchMock.mockImplementationOnce(() => Promise.reject(new Error('network down')));
    const errorRender = renderWithSWR(<GamesPage />);
    await screen.findByText(/Unable to load games/i);
    expect(screen.getByRole('alert').getAttribute('data-view')).toBe('mobile');
    errorRender.unmount();

    matchMedia.mockRestore();
  });
});
