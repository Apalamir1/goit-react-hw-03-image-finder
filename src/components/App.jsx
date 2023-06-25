import React, { Component } from 'react';
import { Report } from 'notiflix/build/notiflix-report-aio';
import css from '../components/App.module.css';
import Searchbar from './SearchBar/Searchbar';
import ImageGallery from './ImageGallery/ImageGallery';
import getImages from 'services-api/Services-api';
import Loader from './Loader/Loader';
import Button from './Button/Button';
import Modal from './Modal/Modal';

export default class App extends Component {
  state = {
    images: [],
    largeImage: {},
    query: '',
    page: 0,
    isModalOpen: false,
    loading: false,
  };
  componentDidUpdate(prevProps, prevState) {
    if (this.state.query !== prevState.query) {
      this.getData();
    }
  }
  getData = async () => {
    const { query, page } = this.state;

    if (query === '') {
      return Report.failure('Plz, enter something...');
    }

    this.setState({ loading: true });

    try {
      const response = await getImages(query, page);
      const hits = response.data.hits;

      this.setState(prevState => {
        if (page === 1) {
          return {
            images: hits,
            page: prevState.page + 1,
            loading: false,
          };
        } else {
          return {
            images: [...prevState.images, ...hits],
            page: prevState.page + 1,
            loading: false,
          };
        }
      });
    } catch (error) {
      Report.failure('Notiflix Failure', `${error}`, 'Okay');
    } finally {
      this.setState({ loading: false });
    }
  };

  onSubmitBtn = dataQuery => {
    this.setState({ query: dataQuery, page: 1, images: [] });
  };

  toggleModal = () => {
    this.setState(({ isModalOpen }) => ({ isModalOpen: !isModalOpen }));
  };
  onImageClick = data => {
    this.setState({ largeImage: data });
    this.toggleModal();
  };

  render() {
    const { images, loading, isModalOpen, largeImage } = this.state;
    return (
      <div className={css.App}>
        <Searchbar onSubmit={this.onSubmitBtn} />
        {images.length !== 0 && (
          <ImageGallery images={images} onClick={this.onImageClick} />
        )}
        {images.length < 12 ? null : <Button onClick={this.getData} />}

        {loading && <Loader />}
        {isModalOpen && (
          <Modal image={largeImage} onToggle={this.toggleModal} />
        )}
      </div>
    );
  }
}
