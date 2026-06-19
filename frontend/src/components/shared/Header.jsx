import logoWhite from '../../assets/tortilla-logo-white.png'

export default function Header({ right }) {
  return (
    <header className="app-header">
      <img src={logoWhite} alt="Tortilla" className="app-header__logo" />
      {right && <div className="app-header__right">{right}</div>}
    </header>
  )
}
