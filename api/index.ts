import { createStartHandler } from '@tanstack/react-start/server';
import { getRouter } from '../src/router';

export default createStartHandler(getRouter);
