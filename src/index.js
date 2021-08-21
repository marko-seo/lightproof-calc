import React from 'react';
import ReactDOM from 'react-dom';
import commerce from './commerce.js';
import price from './price.js';

import './index.sass';
import Swiper from 'swiper/js/swiper.esm.bundle';
import 'swiper/css/swiper.css';

function Tooltip(props) {
	return (
		<span className="calc-tooltip">
			<small>?</small>
			<span
				className="calc-tooltip__content"
				dangerouslySetInnerHTML={{ __html: props.description }}
			/>
		</span>
	)
}

function Nav(props) {
	let nav = props.nav;

	nav = nav.map((item, i) =>
		<li
			key={i.toString()}
			className={i === props.activeNav ? 'calc-nav__item calc-nav__item--active' : 'calc-nav__item'}
		>
			{item}
		</li>
	);

	return (
		<nav className="calc-nav calc__calc-nav">
			{props.history.length > 0 &&
				<span
					className="calc-nav__prev"
					onClick={props.onClick}
				>&#8249;</span>
			}
			<ul className="calc-nav__list">{nav}</ul>
			<div className="calc-nav__stages">
				<span className="calc-nav__stages-caption">
					Шаг {props.activeNav + 1}:
 					</span>
				<span className="calc-nav__stages-num">
					Выберите {props.activeNav === 1 ? "категорию" : props.nav[props.activeNav]}
				</span>
			</div>
		</nav>
	)
}

function Circle(props) {
	return (
		<div className={props.cssValues} onClick={props.onClick}>
			<picture className="calc-circle__img">
				<img
					src={'/widget'+props.category.images}
				/>
			</picture>
			<p className="calc-circle__capt">
				<span className="calc-circle_text">{props.category.title}</span>
				{'description' in props.category &&
					<Tooltip
						description={props.category.description}
					/>
				}
			</p>
		</div>
	)
}

class Filters extends React.Component {
	getCssClass(cat) {
		if (cat.disable) {
			return "calc-circle calc-circle--disable calc__calc-circle";
		} else {
			return "calc-circle calc__calc-circle";
		}
	}

	renderCircles(cat, i) {
		let currentCat = this.props.categories[i];

		return (
			<Circle
				// key={currentCat.title}
				category={this.props.categories[i]}
				cssValues={this.getCssClass(currentCat)}
				onClick={() => this.props.onClick(cat, i)}
			/>
		)
	}

	render() {
		const circles = this.props.categories.map((cat, i) => {
			return this.renderCircles(cat, i);
		});

		return (
			<div className="calc-filters">
				{circles}
			</div>
		)
	}
}

function FieldEntry(props) {
	let min, max;

	if (props.prices && props.name in props.prices && props.isShowMess[props.name]) {
		min = props.prices[props.name].min * 10;
		max = props.prices[props.name].max * 10;
	}

	return (
		<div className="calc-form__group">
			<input
				type="text"
				name={props.name}
				value={props.value}
				onInput={props.onInput}
				className="calc-form__field"
				disabled={props.prices ? false : true}
			/>
			<span className="calc-form__metrics">мм</span>
			{props.prices && props.name in props.prices && props.isShowMess[props.name] &&
				<small className="calc-form__comment">Допустимые значения от {min}мм до {max}мм</small>
			}
		</div>
	)
}

function Checkbox(props) {
	return (
		<label className="check calc-form__check">
			<input
				checked={props.isChecked}
				onChange={props.onChange}
				name={props.name}
				className="check__input"
				type="checkbox"
			/>
			<span className="check__box"></span>
			<span className="check__text">
				{props.name}
			</span>
		</label>
	)
}

class Form extends React.Component {

	constructor(props) {
		super(props);
		this.handleInput = this.handleInput.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.showFeedback = this.showFeedback.bind(this);
		this.hideFeedback = this.hideFeedback.bind(this);
		this.state = {
			formData: {
				options: [
					{ 'name': 'С электроприводом', 'val': 13000, isChecked: false },
					{ 'name': 'С фотопечатью', 'val': 2200, isChecked: false }
				],
				size: {
					width: '',
					height: ''
				},
				// showMessLimit: false,
				showMessLimit: {
					width: false,
					height: false
				}
			},
			valute: null,
			isFeedback: false,
		};
		this.finalPrice = null;
	}

	returnCaptMat(newVal, oldVal) {
		if (newVal) {
			return newVal.title.rendered;
		} else {
			return oldVal;
		}
	}

	isInt(input) {
		if (!Number.isInteger(Number(input))) {
			return Number(input !== '' ? input = input.slice(0, -1) : input = '');
		} else {
			return Number(input);
		}
	}

	checkOnExceptions() {
		return this.props.history.find(item => {
			let title = item.title;
			if (title.search('ЗЕБРА') !== -1
				|| title.search('плиссе') !== -1
				|| title.search('Зебра') !== -1
				|| title.search('Пластиковые') !== -1
				|| title.search('Алюминиевые') !== -1
				|| title.search('Бриз') !== -1
				|| title.search('Пластиковые') !== -1
				|| title.search('Алюминиевые') !== -1
				|| title.search('Горизонтальные жалюзи') !== -1
				|| title.search('Изолайт') !== -1) {
				return true;
			} else {
				return false;
			}
		});
	}

	hanldeInputChecked(i, event) {
		const target = event.target;
		const isChecked = this.state.formData.options[i].isChecked;
		let formData = this.state.formData;
		formData.options[i].isChecked = !isChecked;
		this.setState({
			formData: formData
		})
	}

	handleInput(event) {
		const data = this.state.formData;
		const name = event.target.name;
		const num = this.isInt(event.target.value) === 0 ? '' : this.isInt(event.target.value);
		data.size[name] = num;

		if ('width' in this.props.prices) {
			const minLimit = Number(this.props.prices[name].min) * 10;
			const maxLimit = Number(this.props.prices[name].max) * 10;

			if (minLimit <= data.size[name] && maxLimit >= data.size[name]) {
				data.showMessLimit[name] = false;
			} else {
				data.showMessLimit[name] = true;
			}
		}

		this.setState({
			formData: data
		})
	}

	calcPrice() {
		if (!this.props.prices) {
			this.finalPrice = null;
			return {
				status: false,
				message: 'Выберите систему и ткань'
			};
		}

		if (this.state.formData.size.width === ''
			|| this.state.formData.size.height === '') {
			return {
				status: false,
				message: 'Введите ширину и высоту'
			};
		}

		let finalVal;
		const width = (this.state.formData.size.width / 1000).toFixed(1);
		const height = (this.state.formData.size.height / 1000).toFixed(1);

		if ('price' in this.props.prices) {
			let area = width * height;
			finalVal = Math.trunc(area * Number(this.props.prices.price) * Number(this.state.valute));
		} else if (this.props.prices === false) {
			this.finalPrice = null;
			return 'Товар не доступен';
		} else {
			if (width in this.props.prices) {
				if (height in this.props.prices[width]) {
					finalVal = Math.trunc(Number(this.props.prices[width][height]) * Number(this.state.valute));
				}
			}
		}

		if (finalVal) {
			const optWithElect = this.state.formData.options[0].isChecked ? this.state.formData.options[0].val : 0;
			const optWithPhoto = this.state.formData.options[1].isChecked ? this.state.formData.options[1].val : 0;
			let priceWithPhoto = (optWithPhoto * (width * height));

			// if size < 1
			if (this.props.history.find(item => "minCalcArea" in item)) {
				if ((width * height) < 1) {
					priceWithPhoto = optWithPhoto * 1;
				}
			}

			// markup 
			if (this.props.history.find(item => "markup" in item)) {
				let tmp = this.props.history.find(item => "markup" in item);

				if (tmp.title == 'День-ночь') {
					finalVal *= 2;
				}

				finalVal += Math.trunc(tmp.markup * Number(this.state.valute));
			}

			finalVal = finalVal + priceWithPhoto + optWithElect + ' ₽';
			this.finalPrice = finalVal;

			if (this.props.prices && 'width' in this.props.prices) {
				for (var prop in this.state.formData.showMessLimit) {
					if (this.state.formData.showMessLimit[prop] === true) {
						return {
							status: false,
							message: 'Размеры указаны неверно. Введите допустимые ширину и высоту в мм или обратитесь за помощью к менеджеру'
						}
					}
				}
			}

			return {
				status: true,
				message: finalVal
			};
		} else {
			this.finalPrice = null;
			return {
				status: false,
				message: 'Размеры указаны неверно. Введите допустимые ширину и высоту в мм или обратитесь за помощью к менеджеру'
			};
		}
	}

	handleSubmit(e) {
		e.preventDefault();
		const target = e.target;
		const formData = new FormData(target);

		const uri = 'mail.php';

		fetch(uri, {
			method: 'POST',
			body: formData
		})
			.then(res => {
				target.reset();
				this.hideFeedback();
			})
			.then(data => console.log(data))
	}

	showFeedback() {
		if (this.finalPrice) {
			this.setState({
				isFeedback: true
			})
		}
	}

	hideFeedback() {
		this.setState({
			isFeedback: false
		})
	}

	componentDidMount() {
		fetch('https://www.cbr-xml-daily.ru/daily_json.js')
			.then(res => res.json())
			.then(data => {
				let valute = data['Valute']['USD']['Value'];
				this.setState({
					valute: valute
				})
			})
	}

	render() {
		let select = null;
		const isOptPhoto = this.checkOnExceptions();

		if (this.props.history.length > 2) {
			if (this.props.history[0].id === 30) {
				const curVal = this.props.history[this.props.history.length - 1].title;
				let options = this.props.currentFilter.map((option, i) =>
					<option key={(i + '-' + option.title).toString()} value={option.title}>
						{option.title}
					</option>
				)
				select = (
					<select className="calc-form__select" value={curVal} onChange={this.props.onChange}>
						{options}
					</select>
				)
			}
		}

		return (
			<form className="calc-form" onSubmit={this.handleSubmit}>
				<div className="calc-form__group">
					<p className="calc-form__title">ВИД</p>
					<input
						className="calc-form__nofield"
						value={this.props.history[0] ? this.props.history[0].title : "Выберите вид"}
						type="text"
						name="view"
						readOnly
					/>
					{select}
				</div>
				<div className={this.props.selectedProd ? 'calc-form__nofield' : 'calc-form__nofield calc-form--opacity'}>
					<p className="calc-form__title">МАТЕРИАЛ</p>
					<div
						class="calc-form__nofield"
						dangerouslySetInnerHTML={{ __html: this.returnCaptMat(this.props.selectedProd, "Выберите материал") }}
					></div>
				</div>
				<fieldset className="calc-form__fieldset">
					<legend className="calc-form__title">размеры (шХв)</legend>
					<FieldEntry
						value={this.state.formData.size.width}
						onInput={this.handleInput}
						prices={this.props.prices}
						isShowMess={this.state.formData.showMessLimit}
						name="width"
					/>
					<span className="calc-form__to">&times;</span>
					<FieldEntry
						value={this.state.formData.size.height}
						onInput={this.handleInput}
						prices={this.props.prices}
						isShowMess={this.state.formData.showMessLimit}
						name="height"
					/>
				</fieldset>
				<fieldset className={this.props.selectedProd ? 'calc-form__fieldset' : 'calc-form__fieldset calc-form--opacity'}>
					<legend className="calc-form__title">
						дополнительные опции
						<Tooltip
							description="При выборе дополнительных опций итоговая цена может измениться"
						/>
					</legend>
					<Checkbox
						onChange={this.hanldeInputChecked.bind(this, 0)}
						name={this.state.formData.options[0].name}
						isChecked={this.state.formData.options[0].isChecked}
						val={this.state.formData.options[0].val}
					/>
					{!isOptPhoto &&
						<Checkbox
							onChange={this.hanldeInputChecked.bind(this, 1)}
							name={this.state.formData.options[1].name}
							isChecked={this.state.formData.options[1].isChecked}
							val={this.state.formData.options[1].val}
						/>
					}
				</fieldset>
				{ this.calcPrice()['status']
					? <div className={this.props.selectedProd ? "calc-form__action" : "calc-form__action calc-form--opacity"}>
						<p className="calc-form__title">стоимость</p>
						<input name="sum" type="text" className="calc-form__sum" value={this.calcPrice()['message']} readOnly />
						<button type="button" className="calc-form__btn" onClick={this.showFeedback}>
							Заказать
							</button>
						<p className="calc-form__info">Замер и установка <b>бесплатно</b></p>
					</div>
					: <div className="calc-form__message">
						<p>{this.calcPrice()['message']}</p>
					</div>
				}
				{/* Feedback */}
				{this.state.isFeedback &&
					<fieldset className="calc-form__feedback">
						<div className="calc-form__feedback-inner">
							<span className="calc-form__feedback-close" onClick={this.hideFeedback}>×</span>
							<label>
								<span>Ваше имя</span>
								<input className="calc-form__field" name="name" type="text" required />
							</label>
							<label>
								<span>Ваш номер телефона</span>
								<input className="calc-form__field" name="phone" type="text" required />
							</label>
							<button className="calc-form__small-btn">Заказать</button>
						</div>
					</fieldset>
				}
			</form>
		)
	}
}

function Download() {
	return (
		<div className="calc-download">
			<p className="calc-download__text">
				Загрузка...
			</p>
		</div>
	)
}

class Slider extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isVertical: true,
			activeCircle: null
		}
	}

	componentDidMount() {
		const self = this;
		const btn = document.querySelector('.calc__swiper-btn');
		const swiper = new Swiper('.swiper-container', {
			observer: true,
			navigation: {
				nextEl: '.swiper-button-next',
				prevEl: '.swiper-button-prev'
			},
		})

		if (btn) {

			btn.addEventListener('click', () => {
				self.setState({
					isVertical: !this.state.isVertical
				});

				swiper.destroy(true, true);
				new Swiper('.swiper-container', {
					direction: 'vertical',
					freeMode: true,
				})
			})

		}

	}

	renderSlides() {
		const slides = this.props.material.map((item, i) => {
			return (
				<div key={item[0]['id']} className="calc_swiper-slide swiper-slide">
					<div className="calc__products">
						{item.map((product, j) => (
							<div key={i + '-' + j} className="calc__product-wrap">
								<div
									className={product.id === this.props.selectedProd.id ? 'calc__product calc__product--active' : 'calc__product'}
									onClick={() => this.props.onClick(product)}
								>
									<img src={product['meta_data_thumbnail']['image_src']} />
								</div>
							</div>
						))}
					</div>
				</div>
			)
		})

		return slides;
	}

	render() {
		const nav = (
			<>
				<div className="swiper-button-prev"></div>
				<div className="swiper-button-next"></div>
			</>
		)

		return (
			<div className="calc__slider">
				<div className="calc__slider-inner">
					<div className="swiper-container calc__swiper-container">
						<div className="swiper-wrapper">
							{this.renderSlides()}
						</div>
						{true &&
							nav
						}
					</div>
					<div className="calc__swiper-action">
						{!this.state.isVertical &&
							<button className="calc__swiper-btn">
								Показать всё
							</button>
						}
					</div>
				</div>
			</div>
		)
	}
}

class Material extends React.Component {

	render() {
		if (!this.props.isLoaded) {
			return <Download />
		}

		return (
			<Slider
				onClick={this.props.onClick}
				material={this.props.material}
				selectedProd={this.props.selectedProd || 0}
			/>
		)
	}
}

class App extends React.Component {

	constructor(props) {
		super(props);
		this.handleClick = this.handleClick.bind(this);
		this.handleClickProd = this.handleClickProd.bind(this);
		this.handleClickPrev = this.handleClickPrev.bind(this);
		this.handleChangeSelect = this.handleChangeSelect.bind(this);

		this.state = {
			nav: [
				'вид',
				'категория',
				'материал'
			],
			activeNav: 0,
			filters: commerce.categories,
			currentFilter: commerce.categories,
			history: [],
			material: [],
			isLoaded: false,
			isFilled: false,
			selectedProd: null,
			objPrice: null
		}
	}

	handleClickProd(prod) {
		// параметр тип: если таблицы с ценовой категорией тогда тип 1 иначе тип 2;
		const product = prod;
		// const uri = 'http://lightproof-app:81/getgdata.php?';
		const uri = '/widget/getgdata.php?';
		const hash = this.state.history.find(item => 'hash' in item);
		const param = {};

		param.hash = hash.hash;
		console.log(hash.title);

		if (hash.title === "Алюминиевые") {
			const name = product.title.rendered.split(',');
			const sizes = ['25', '16', '50', '35'];
			param.list = sizes.find(size => name[0].indexOf(size) !== -1 ? true : false);
			param.range = 'B';
			param.type = '2'
		} else if (prod.metadata['price_category'][0] !== '') {
			let price_cat = prod.metadata['price_category'][0];
			price_cat = price_cat[price_cat.length - 1];
			price_cat = price_cat === 'E' ? 0 : price_cat;
			param.list = `cat${price_cat}`;
			param.range = 'Z';
			param.type = '1';
		} else {
			let lastInHist = this.state.history[this.state.history.length - 1];
			param.range = 'B';
			param.type = '2';
			param.list = lastInHist.title;
		}

		fetch(`${uri}table_hash=${hash.hash}&list=${param.list}&col=${param.range}&type=${param.type}`)
			.then(res => res.json())
			.then(data => {
				let data_price = '';
				if (Array.isArray(data)) {
					let title = product.title.rendered.toLowerCase();
					// If перфорация
					if (title.indexOf('перфорация') !== -1) {
						console.log('popal perf');
						data_price = data.find(item => {
							if (title.indexOf(item.name.toLowerCase()) !== -1 && item.name.toLowerCase().indexOf('перфорация') !== -1) {
								console.log('popal perf2');
								return true;
							}
							return false;
						});
					} else {
						data_price = data.find(item => {
							if (title.indexOf(item.name.toLowerCase()) !== -1) {
								return true;
							}
							return false;
						});
					}
				} else {
					data_price = data;
				}
				this.setState({
					selectedProd: product,
					objPrice: data_price
				});
			});

	}

	handleClick(cat, isReplace = false) {
		const history = this.state.history.slice();
		const currentFilter = this.addMoves(cat);
		const currentCat = cat;
		isReplace ? history.splice(history.length - 1, 1, currentCat) : history.push(currentCat);
		if (currentFilter[0]) {
			this.setState({
				history: history,
				activeNav: currentFilter[1],
				currentFilter: currentFilter[0],
			});
		} else {
			let num = 0;

			history.forEach((item, i) => {
				if (i > 0) {
					num = ('id' in item) ? i : 0;
				}
			})

			this.getProducts(history[num]['id'], 100);

			this.setState({
				history: history,
				activeNav: currentFilter[1],
				isFilled: true
			})
		}
	}

	getProducts(id, perPage) {
		// const uri = "http://lightproof:81/wp-json/wp/v2/";
		const uri = "https://lightproof.ru/wp-json/wp/v2/";
		let pages = 0;

		fetch(`${uri}catalog/?categories=${id}&page=1&per_page=${perPage}&order=asc&orderby=title`)
			.then(res => {
				pages = res.headers.get('X-WP-TotalPages');
				return res.json();
			})
			.then(async (data) => {
				let arrsRes = [];
				arrsRes.push(data);

				for (var i = 2; i <= pages; i++) {
					let curentRes = fetch(`${uri}catalog/?categories=${id}&page=${i}&per_page=${perPage}&order=asc&orderby=title`)
						.then(res => {
							if (res.status != 200) {
								return null;
							} else {
								return res.json();
							}
						},
							failRes => {
								return null;
							}
						);
					arrsRes.push(curentRes);
				}

				arrsRes = await Promise.all(arrsRes);

				const tmpArr = [];

				arrsRes.forEach(arr => {
					arr.forEach(item => {
						tmpArr.push(item);
					});
				});

				arrsRes = [];

				const arrSize = 16;

				for (var i = 0; i < tmpArr.length; i += arrSize) {
					arrsRes.push(tmpArr.slice(i, i + arrSize));
				}

				this.setState({
					material: arrsRes,
					isLoaded: true
				})
			})
			.catch(error => console.log(error))
	}

	addMoves(cat) {
		const currentCat = cat;

		switch (true) {
			case ('views' in currentCat):
				return [currentCat['views'], 0];
			case ('subcategories' in currentCat):
				return [currentCat['subcategories'], 1];
			case ('subviews' in currentCat):
				return [currentCat['subviews'], 0];
			default:
				return [null, 2];
		}
	}

	handleClickPrev() {
		let history = this.state.history.slice();
		history.splice(history.length - 1, 1);
		let currentFilter;
		if (history.length > 0) {
			currentFilter = this.addMoves(history[history.length - 1]);
		} else {
			currentFilter = [this.state.filters, 0];
		}

		if (this.state.isFilled) {
			this.setState({
				history: history,
				isFilled: false,
				material: [],
				isLoaded: false,
				objPrice: null,
				selectedProd: null,
				activeNav: currentFilter[1],
				currentFilter: currentFilter[0]
			})
		} else {
			this.setState({
				history: history,
				activeNav: currentFilter[1],
				currentFilter: currentFilter[0]
			})
		}
	}

	handleChangeSelect(e) {
		const target = e.target.value;
		let history = this.state.history.slice();

		// console.log(target);
		this.state.currentFilter.find(filter => {
			if (filter.title === target) {
				this.handleClick(filter, true);
				this.setState({
					objPrice: null,
					selectedProd: null
				})
			}
		});

	}

	render() {
		let circle;

		if (this.state.isFilled) {
			circle = (
				<Material
					material={this.state.material}
					isLoaded={this.state.isLoaded}
					selectedProd={this.state.selectedProd}
					onClick={(prod) => this.handleClickProd(prod)}
				/>
			)
		} else {
			circle = (
				<Filters
					categories={this.state.currentFilter}
					onClick={(cat) => this.handleClick(cat)}
				/>
			)
		}

		return (
			<section className="calc">
				<h4 className="calc__head">Калькулятор расчета стоимости</h4>
				<div className="calc__inner">
					<div className="calc__left">
						<Nav
							nav={this.state.nav}
							onClick={this.handleClickPrev}
							history={this.state.history}
							activeNav={this.state.activeNav}
						/>
						{circle}
					</div>
					<div className="calc__right">
						<Form
							onChange={this.handleChangeSelect}
							currentFilter={this.state.currentFilter}
							history={this.state.history}
							prices={this.state.objPrice}
							selectedProd={this.state.selectedProd}
						/>
					</div>
				</div>
			</section>
		)
	}
}

ReactDOM.render(
	<App />,
	document.getElementById('root')
)