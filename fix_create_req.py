with open("src/pages/CreateRequest.tsx", "r") as f:
    content = f.read()

prefix = """import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import {
  DEPARTMENTS,
  UOM_OPTIONS,
  WASTE_TYPES,
  CATEGORIES,
  SYSTEMS,
  LOCATIONS,
  MOVEMENT_LOCATIONS,
  generateId,
} from '@/data/constants';
import type { ScrapItem } from '@/types';
"""

content = prefix + content

with open("src/pages/CreateRequest.tsx", "w") as f:
    f.write(content)
