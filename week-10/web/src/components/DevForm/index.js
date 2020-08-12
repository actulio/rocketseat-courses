import React from 'react'

function DevForm({ onSubmit }) {

	const [latitude, setLatitude] = React.useState('');
	const [longitude, setLongitude] = React.useState('');
	const [github_username, setGithub_username] = React.useState('');
	const [techs, setTechs] = React.useState('');	

	React.useEffect(()=>{
		navigator.geolocation.getCurrentPosition(
			(position) => {
				const { latitude, longitude } = position.coords;
				setLatitude(latitude);
				setLongitude(longitude);
			},
			(err) => {
				console.log("TCL: App -> err", err);
				const latitude = -10.9830646;
				const longitude = -37.0722295;
				setLatitude(latitude);
				setLongitude(longitude);
			},
			{
				timeout: 30000,
			}
		);
	},[]);

	async function handleSubmit(e){
		e.preventDefault();

		await onSubmit({
			github_username,
			techs,
			latitude,
			longitude
		});

		setGithub_username('');
		setTechs('');
	}

	return (
		<form onSubmit={handleSubmit} >
			<div className="input-block">
				<label htmlFor="github_username" >Usuário do Github</label>
				<input
					name="github_username"
					id="github_username"
					value={github_username}
					onChange={e => setGithub_username(e.target.value)}
					required />
			</div>

			<div className="input-block">
				<label htmlFor="techs" >Tecnologias</label>
				<input
					name="techs"
					id="techs"
					value={techs}
					onChange={e => setTechs(e.target.value)}
					required />
			</div>

			<div className="input-group">
				<div className="input-block">
					<label htmlFor="latitude" >Latitude</label>
					<input
						name="latitude"
						id="latitude"
						value={latitude}
						onChange={e => setLatitude(e.target.value)}
						required />
				</div>

				<div className="input-block">
					<label htmlFor="longitude" >Longitude</label>
					<input
						name="longitude"
						id="longitude"
						value={longitude}
						onChange={e => setLongitude(e.target.value)}
						required />
				</div>
			</div>

			<button type="submit">Salvar</button>

		</form>
	)
}

export default DevForm;

