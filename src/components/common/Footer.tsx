import logo from '../../assets/logo_vega.png'

const Footer = () => {
    return (
        <div
            style={{
                color: "#fff",
                background: "#000000ff",
                position: "fixed",
                height: "3vh",
                bottom: 0,
                left: 0,
                width: "100%",
                display: 'flex'
            }}
        >
            <img src={logo}
                style={{
                    height: "2vh",
                    marginLeft: '1.4vw'
                }}
                alt="" />
            <p
            style={{
                color:'#918e8eff',
                fontSize:'2vh'
            }}
            >MPLS Portal - Powered by SiMPLuS &copy; Vegayan Systems.</p>
        </div>
    );
};

export default Footer;
