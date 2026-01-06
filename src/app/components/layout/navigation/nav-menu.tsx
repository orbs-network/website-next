import { ChevronDownIcon } from 'lucide-react'
import { NavButton } from './nav-button'
import { NavDropdown } from './nav-dropdown'

function NavIcon() {
  return <ChevronDownIcon className="size-5 group-hover:rotate-180 transition-transform duration-200" />
}

export function NavMenu() {
  return (
    <div className="relative">
      <ul className="flex items-center gap-4">
        <li className="group relative">
          <NavButton href="/products">
            Products <NavIcon />
          </NavButton>
          <NavDropdown>
            <ul>
              <li>
                <NavButton href="/products/1">Liquidity Hub</NavButton>
              </li>
              <li>
                <NavButton href="/products/2">Perpetual Hub</NavButton>
              </li>
              <li>
                <NavButton href="/products/3">
                  <span>
                    <span className="lowercase">d</span>TWAP
                  </span>
                </NavButton>
              </li>
              <li>
                <NavButton href="/products/3">
                  <span>
                    <span className="lowercase">d</span>LIMIT
                  </span>
                </NavButton>
              </li>
              <li>
                <NavButton href="/products/3">
                  <span>
                    <span className="lowercase">d</span>SLTP
                  </span>
                </NavButton>
              </li>
            </ul>
          </NavDropdown>
        </li>
        <li className="group relative">
          <NavButton href="/resources">
            Resources <NavIcon />
          </NavButton>
          <NavDropdown>
            <ul>
              <li>
                <NavButton href="/resources/1">Tetra</NavButton>
              </li>
              <li>
                <NavButton href="/resources/2">Staking Calculator</NavButton>
              </li>
              <li>
                <NavButton href="/resources/3">FAQ & Support</NavButton>
              </li>
              <li>
                <NavButton href="/resources/3">Branding Kit</NavButton>
              </li>
            </ul>
          </NavDropdown>
        </li>
        <li className="group relative">
          <NavButton href="/developers">
            Developers <NavIcon />
          </NavButton>
          <NavDropdown>
            <ul>
              <li>
                <NavButton href="/developers/1">Documentation</NavButton>
              </li>
              <li>
                <NavButton href="/developers/2">API Reference</NavButton>
              </li>
              <li>
                <NavButton href="/developers/3">GitHub</NavButton>
              </li>
            </ul>
          </NavDropdown>
        </li>
        <li>
          <NavButton href="/blog">Blog</NavButton>
        </li>
      </ul>
    </div>
  )
}
