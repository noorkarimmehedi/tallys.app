import { CalendarClock, Plus } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '../ui/3d-button-simple';
import { Card } from '../ui/card';
import { motion } from 'framer-motion';

export default function CreateEventButton() {
  return (
    <Link href="/event-builder/new">
      <motion.div 
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="h-full"
      >
        <Card className="flex flex-col items-center justify-center p-6 h-full border border-dashed border-gray-300 hover:border-primary cursor-pointer bg-white/50 backdrop-blur-sm">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <CalendarClock className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-medium mb-2">Create Event</h3>
          <p className="text-sm text-gray-500 text-center mb-4">Schedule appointments with your customers</p>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-1" /> New Event
          </Button>
        </Card>
      </motion.div>
    </Link>
  );
}